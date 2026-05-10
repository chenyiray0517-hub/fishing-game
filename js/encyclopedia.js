class Encyclopedia {
  constructor() {
    this.open = false;
    this.tab  = 'fish';   // 'fish' | 'items'
    this.selectedIdx = 0;
    this.scroll      = 0;

    // fish id → { sceneName: [spotName, ...] }
    this._fishLocs = {};
    // item id → [sceneName, ...]
    this._itemScenes = {};

    const sceneDefs = [
      { name: '海洋',     spots: CONFIG.SPOTS       },
      { name: '湖邊',     spots: CONFIG.LAKE_SPOTS  },
      { name: '海灘',     spots: CONFIG.BEACH_SPOTS },
      { name: '第二海',   spots: CONFIG.OCEAN2_SPOTS},
      { name: '秘密池塘', spots: CONFIG.POND_SPOTS  },
    ];

    for (const { name, spots } of sceneDefs) {
      for (const spot of spots) {
        for (const fid of spot.fish) {
          if (!this._fishLocs[fid]) this._fishLocs[fid] = {};
          if (!this._fishLocs[fid][name]) this._fishLocs[fid][name] = [];
          this._fishLocs[fid][name].push(spot.name);
        }
        for (const drop of (spot.itemDrops || [])) {
          if (!this._itemScenes[drop.id]) this._itemScenes[drop.id] = [];
          if (!this._itemScenes[drop.id].includes(name))
            this._itemScenes[drop.id].push(name);
        }
      }
    }
  }

  toggle() { this.open = !this.open; this.selectedIdx = 0; this.scroll = 0; }
  close()  { this.open = false; }

  _switchTab(tab) {
    if (this.tab === tab) return;
    this.tab = tab; this.selectedIdx = 0; this.scroll = 0;
  }

  _clampScroll(listLen, maxRows) {
    if (this.selectedIdx < this.scroll) this.scroll = this.selectedIdx;
    if (this.selectedIdx >= this.scroll + maxRows)
      this.scroll = this.selectedIdx - maxRows + 1;
    this.scroll = Math.max(0, Math.min(this.scroll, Math.max(0, listLen - maxRows)));
  }

  // ── 鍵盤 ────────────────────────────────────────────────────────────
  handleKey(key) {
    const k = key.toLowerCase();
    if (key === 'Escape' || k === 'h') { this.close(); return; }
    if (key === 'ArrowLeft')  { this._switchTab('fish');  return; }
    if (key === 'ArrowRight') { this._switchTab('items'); return; }
    const len = this.tab === 'fish' ? CONFIG.FISH.length : CONFIG.ITEMS.length;
    if (key === 'ArrowUp')   this.selectedIdx = Math.max(0, this.selectedIdx - 1);
    if (key === 'ArrowDown') this.selectedIdx = Math.min(len - 1, this.selectedIdx + 1);
  }

  // ── 觸控 ────────────────────────────────────────────────────────────
  handleTouch(p) {
    const PX = 40, PY = 50, PW = CONFIG.W - 80, PH = CONFIG.H - 100;

    // 關閉按鈕
    if (p.x > CONFIG.W - 56 && p.y < 88) { this.close(); return; }

    // Tab 列
    if (p.y >= PY + 56 && p.y <= PY + 86) {
      this._switchTab(p.x < CONFIG.W / 2 ? 'fish' : 'items');
      return;
    }

    if (this.tab === 'fish') {
      const COLS = 4, cellW = Math.floor((PW - 20) / COLS), cellH = 70;
      const startX = PX + 10, startY = PY + 96;
      const maxRows = Math.floor((PH - 96 - 90 - 8) / cellH);
      for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < COLS; col++) {
          const idx = (row + this.scroll) * COLS + col;
          if (idx >= CONFIG.FISH.length) continue;
          const cx = startX + col * cellW, cy = startY + row * cellH;
          if (p.x >= cx && p.x < cx + cellW && p.y >= cy && p.y < cy + cellH) {
            this.selectedIdx = idx; return;
          }
        }
      }
    } else {
      const startY = PY + 100, rowH = 62;
      const maxRows = Math.floor((PH - 100 - 72 - 10) / rowH);
      for (let i = 0; i < maxRows; i++) {
        const idx = i + this.scroll;
        if (idx >= CONFIG.ITEMS.length) continue;
        const ry = startY + i * rowH;
        if (p.y >= ry && p.y < ry + rowH && p.x > PX + 14 && p.x < PX + PW - 14) {
          this.selectedIdx = idx; return;
        }
      }
    }
  }

  // ── 主渲染 ──────────────────────────────────────────────────────────
  render(ctx, player) {
    if (!this.open) return;
    const PX = 40, PY = 50, PW = CONFIG.W - 80, PH = CONFIG.H - 100;

    // 遮罩
    ctx.fillStyle = 'rgba(5,10,25,0.88)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // 面板
    ctx.fillStyle = '#0a1828';
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.fill();
    ctx.strokeStyle = '#2a5080'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.stroke();

    // 標題
    ctx.fillStyle = '#88ccff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('📖 圖鑑', CONFIG.W / 2, PY + 36);

    // 分隔線
    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, PY + 48); ctx.lineTo(PX + PW - 20, PY + 48); ctx.stroke();

    // Tabs
    const tabW = Math.floor((PW - 44) / 2), TAB_Y = PY + 56, TAB_H = 28;
    [['fish','🐟 魚類'], ['items','📦 道具']].forEach(([t, label], i) => {
      const tx = PX + 22 + i * (tabW + 4), active = this.tab === t;
      ctx.fillStyle = active ? '#1a4a80' : 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.roundRect(tx, TAB_Y, tabW, TAB_H, 6); ctx.fill();
      ctx.strokeStyle = active ? '#4488cc' : '#1a3860'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(tx, TAB_Y, tabW, TAB_H, 6); ctx.stroke();
      ctx.fillStyle = active ? '#88ccff' : '#445566';
      ctx.font = `${active ? 'bold ' : ''}14px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(label, tx + tabW / 2, TAB_Y + 19);
    });

    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, PY + 92); ctx.lineTo(PX + PW - 20, PY + 92); ctx.stroke();

    // 關閉按鈕
    ctx.fillStyle = '#443322';
    ctx.beginPath(); ctx.roundRect(CONFIG.W - 76, PY + 10, 26, 26, 6); ctx.fill();
    ctx.fillStyle = '#ffaa55'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', CONFIG.W - 63, PY + 28);

    if (this.tab === 'fish') this._renderFish(ctx, player, PX, PY, PW, PH);
    else                     this._renderItems(ctx, player, PX, PY, PW, PH);
  }

  // ── 魚類頁 ──────────────────────────────────────────────────────────
  _renderFish(ctx, player, PX, PY, PW, PH) {
    const COLS = 4, cellW = Math.floor((PW - 20) / COLS), cellH = 70;
    const startX = PX + 10, startY = PY + 96;
    const DETAIL_H = 90;
    const maxRows = Math.floor((PH - 96 - DETAIL_H - 8) / cellH);
    const totalRows = Math.ceil(CONFIG.FISH.length / COLS);

    // 捲動對齊（以「列」為單位）
    const selRow = Math.floor(this.selectedIdx / COLS);
    if (selRow < this.scroll) this.scroll = selRow;
    if (selRow >= this.scroll + maxRows) this.scroll = selRow - maxRows + 1;
    this.scroll = Math.max(0, Math.min(this.scroll, Math.max(0, totalRows - maxRows)));

    // 格子
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = (row + this.scroll) * COLS + col;
        if (idx >= CONFIG.FISH.length) continue;
        const fish = CONFIG.FISH[idx];
        const known = !!(player.caughtIds?.[fish.id]);
        const sel   = idx === this.selectedIdx;
        const cx = startX + col * cellW, cy = startY + row * cellH;

        ctx.fillStyle = sel ? 'rgba(40,120,200,0.35)' : 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.roundRect(cx + 2, cy + 2, cellW - 4, cellH - 4, 8); ctx.fill();
        if (sel) {
          ctx.strokeStyle = '#4488cc'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(cx + 2, cy + 2, cellW - 4, cellH - 4, 8); ctx.stroke();
        }

        if (known) {
          ctx.save();
          ctx.beginPath(); ctx.rect(cx + 4, cy + 4, cellW - 8, 42); ctx.clip();
          sprites.fish(ctx, fish.id, cx + cellW / 2, cy + 24, fish.sz, fish.color, 1);
          ctx.restore();
          ctx.fillStyle = sel ? '#ffffff' : '#cce8ff';
          ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(fish.name, cx + cellW / 2, cy + 55);
          ctx.fillStyle = '#99ddaa'; ctx.font = '11px sans-serif';
          ctx.fillText(`$${fish.value}`, cx + cellW / 2, cy + 66);
        } else {
          ctx.save();
          ctx.globalAlpha = 0.14;
          ctx.beginPath(); ctx.rect(cx + 4, cy + 4, cellW - 8, 42); ctx.clip();
          sprites.fish(ctx, fish.id, cx + cellW / 2, cy + 24, fish.sz, '#334466', 1);
          ctx.restore();
          ctx.fillStyle = '#445566';
          ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('???', cx + cellW / 2, cy + 55);
          ctx.fillStyle = '#2a3a4a'; ctx.font = '10px sans-serif';
          ctx.fillText('未發現', cx + cellW / 2, cy + 66);
        }
      }
    }

    // 捲動箭頭
    if (this.scroll > 0) {
      ctx.fillStyle = '#4488cc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', CONFIG.W / 2, startY - 6);
    }
    if (this.scroll + maxRows < totalRows) {
      ctx.fillStyle = '#4488cc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', CONFIG.W / 2, startY + maxRows * cellH + 12);
    }

    // 詳情面板
    const detailY = PY + PH - DETAIL_H;
    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, detailY); ctx.lineTo(PX + PW - 20, detailY); ctx.stroke();

    const fish  = CONFIG.FISH[this.selectedIdx];
    const known = !!(player.caughtIds?.[fish.id]);

    if (known) {
      const stars = Math.min(7, Math.round(fish.difficulty));
      const starStr = '★'.repeat(stars) + '☆'.repeat(7 - stars);

      ctx.fillStyle = '#aaddff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(fish.name, PX + 28, detailY + 20);
      ctx.fillStyle = '#aaffcc'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(`售價 $${fish.value}`, PX + PW - 28, detailY + 20);
      ctx.fillStyle = '#ffd700'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`難度　${starStr}`, PX + 28, detailY + 38);

      const locs = this._fishLocs[fish.id] || {};
      const parts = Object.entries(locs).map(([scene, sp]) => `${scene}：${sp.join('、')}`);
      const locLine = parts.join('　') || '無資料';
      ctx.fillStyle = '#556688'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      const maxW = PW - 56;
      if (ctx.measureText('📍 ' + locLine).width <= maxW) {
        ctx.fillText('📍 ' + locLine, PX + 28, detailY + 56);
      } else {
        // 拆兩行
        const half = Math.floor(parts.length / 2) || 1;
        ctx.fillText('📍 ' + parts.slice(0, half).join('　'), PX + 28, detailY + 56);
        ctx.fillText('　　' + parts.slice(half).join('　'),   PX + 28, detailY + 70);
      }
    } else {
      ctx.fillStyle = '#445566'; ctx.font = 'italic 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('尚未釣到這種魚…', CONFIG.W / 2, detailY + 28);
      ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif';
      ctx.fillText('繼續探索不同水域，說不定能遇上！', CONFIG.W / 2, detailY + 50);
    }

    const caughtN = Object.keys(player.caughtIds || {}).length;
    ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    const hint = touch.isMobile ? '' : '　　↑↓ 選擇　← → 切換分頁　H/ESC 關閉';
    ctx.fillText(`已發現 ${caughtN} / ${CONFIG.FISH.length} 種${hint}`, CONFIG.W / 2, PY + PH - 6);
  }

  // ── 道具頁 ──────────────────────────────────────────────────────────
  _renderItems(ctx, player, PX, PY, PW, PH) {
    const rowH = 62, startY = PY + 100;
    const DETAIL_H = 72;
    const maxRows = Math.floor((PH - 100 - DETAIL_H - 10) / rowH);

    this.selectedIdx = Math.min(this.selectedIdx, CONFIG.ITEMS.length - 1);
    this._clampScroll(CONFIG.ITEMS.length, maxRows);

    for (let i = 0; i < maxRows; i++) {
      const idx = i + this.scroll;
      if (idx >= CONFIG.ITEMS.length) continue;
      const item = CONFIG.ITEMS[idx];
      const sel  = idx === this.selectedIdx;
      const ry   = startY + i * rowH;

      if (sel) {
        ctx.fillStyle = 'rgba(40,120,200,0.28)';
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.fill();
        ctx.strokeStyle = '#4488cc'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.stroke();
      }

      // 圖示框
      ctx.fillStyle = sel ? 'rgba(60,140,220,0.30)' : 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(PX + 22, ry + 9, 42, 42, 8); ctx.fill();
      ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(item.icon, PX + 43, ry + 36);

      // 名稱 + 說明
      ctx.fillStyle = sel ? '#ffffff' : '#cce8ff';
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(item.name, PX + 76, ry + 24);
      ctx.fillStyle = '#667788'; ctx.font = '12px sans-serif';
      ctx.fillText(item.desc.split('\n')[0], PX + 76, ry + 42);

      // 取得地點（右側）
      const scenes = this._itemScenes[item.id] || [];
      if (scenes.length > 0) {
        ctx.fillStyle = '#3a5a7a'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('📍 ' + scenes.join('・'), PX + PW - 20, ry + 24);
      }

      // 持有數量
      const count = player.itemCount(item.id);
      if (count > 0) {
        ctx.fillStyle = sel ? '#1a6a44' : '#112a1a';
        ctx.beginPath(); ctx.roundRect(PX + PW - 68, ry + 30, 40, 22, 6); ctx.fill();
        ctx.fillStyle = '#88ffcc'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`×${count}`, PX + PW - 48, ry + 46);
      }
    }

    // 捲動箭頭
    if (this.scroll > 0) {
      ctx.fillStyle = '#4488cc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', CONFIG.W / 2, startY - 6);
    }
    if (this.scroll + maxRows < CONFIG.ITEMS.length) {
      ctx.fillStyle = '#4488cc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', CONFIG.W / 2, startY + maxRows * rowH + 12);
    }

    // 底部詳情
    const detailY = PY + PH - DETAIL_H;
    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, detailY); ctx.lineTo(PX + PW - 20, detailY); ctx.stroke();

    const selItem = CONFIG.ITEMS[this.selectedIdx];
    if (selItem) {
      const desc2 = selItem.desc.split('\n')[1] || '';
      ctx.fillStyle = '#88aacc'; ctx.font = 'italic 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(desc2, CONFIG.W / 2, detailY + 20);

      const scenes = this._itemScenes[selItem.id] || [];
      if (scenes.length > 0) {
        ctx.fillStyle = '#556677'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('取得地點：' + scenes.join('・'), CONFIG.W / 2, detailY + 40);
      }
    }

    ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    const hint = touch.isMobile ? '' : '↑↓ 選擇　← → 切換分頁　H/ESC 關閉';
    ctx.fillText(hint, CONFIG.W / 2, PY + PH - 6);
  }
}
