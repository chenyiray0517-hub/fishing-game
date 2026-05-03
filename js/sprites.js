// sprites.js — fish and rod drawing utilities

const sprites = {

  /**
   * Draw a fish centered at (cx, cy).
   * sz  : CONFIG fish.sz value (controls scale)
   * facing: 1 = right, -1 = left
   */
  fish(ctx, id, cx, cy, sz, color, facing = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(facing, 1);
    (sprites._fish[id] || sprites._fish._default)(ctx, sz, color);
    ctx.restore();
  },

  /**
   * Draw a fishing rod from hand (hx,hy) to tip (tx,ty).
   */
  rod(ctx, id, hx, hy, tx, ty) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(Math.atan2(ty - hy, tx - hx));
    const len = Math.hypot(tx - hx, ty - hy);
    (sprites._rod[id] || sprites._rod.wood)(ctx, len);
    ctx.restore();
  },

  // ── Fish sprites ────────────────────────────────────────────────────

  _fish: {

    _default(ctx, sz, color) {
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, sz*1.5, sz*0.7, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-sz*1.5,0); ctx.lineTo(-sz*2.2,-sz*0.8); ctx.lineTo(-sz*2.2,sz*0.8); ctx.closePath(); ctx.fill();
    },

    // 沙丁魚 — slim silver fish with dorsal fin
    sardine(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, s*2.0, s*0.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*2.0,0); ctx.lineTo(-s*2.9,-s*0.85); ctx.lineTo(-s*2.9,s*0.85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-s*0.4,-s*0.5); ctx.lineTo(s*0.4,-s*0.95); ctx.lineTo(s*1.0,-s*0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(190,230,255,0.75)';
      ctx.beginPath(); ctx.ellipse(-s*0.2, 0, s*1.5, s*0.14, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.4,-s*0.1,s*0.26,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.46,-s*0.1,s*0.13,0,Math.PI*2); ctx.fill();
    },

    // 鯰魚 — flat head, barbels, fan tail
    catfish(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(s*1.8, 0);
      ctx.bezierCurveTo(s*1.8,-s*0.8, -s*0.4,-s*0.85, -s*1.6,0);
      ctx.bezierCurveTo(-s*0.4,s*0.85, s*1.8,s*0.8, s*1.8,0);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.32; ctx.lineCap = 'round';
      [[-s*2.8,-s*0.95],[-s*3.0,0],[-s*2.8,s*0.95]].forEach(([tx,ty])=>{
        ctx.beginPath(); ctx.moveTo(-s*1.6,0); ctx.lineTo(tx,ty); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(60,40,10,0.8)'; ctx.lineWidth = s*0.13;
      [[s*1.7,-s*0.28,s*2.6,-s*0.9],[s*1.8,-s*0.05,s*2.9,-s*0.25],
       [s*1.7, s*0.28,s*2.6, s*0.9],[s*1.8, s*0.05,s*2.9, s*0.25]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(0,-s*0.85); ctx.lineTo(s*0.7,-s*1.55); ctx.lineTo(s*1.2,-s*0.85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*0.95,-s*0.3,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.0,-s*0.3,s*0.14,0,Math.PI*2); ctx.fill();
    },

    // 鱸魚 — deep oval body, spiky dorsal, stripes
    bass(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.ellipse(0, s*0.05, s*1.8, s*0.95, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.7,s*0.05); ctx.lineTo(-s*2.55,-s*1.0); ctx.lineTo(-s*2.55,s*1.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-s*0.8,-s*0.95); ctx.lineTo(-s*0.3,-s*1.85); ctx.lineTo(s*0.2,-s*1.6); ctx.lineTo(s*0.6,-s*1.75); ctx.lineTo(s*1.0,-s*1.5); ctx.lineTo(s*1.2,-s*0.95);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(30,50,80,0.45)'; ctx.lineWidth = s*0.18;
      ctx.beginPath(); ctx.moveTo(-s*1.1,-s*0.3); ctx.lineTo(s*1.1,-s*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.3,s*0.25); ctx.lineTo(s*0.9,s*0.25); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.1,-s*0.2,s*0.32,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.16,-s*0.2,s*0.16,0,Math.PI*2); ctx.fill();
    },

    // 比目魚 — wide flat oval, both eyes on top side
    flounder(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.8;
      ctx.save(); ctx.rotate(0.12);
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.9, s*1.25, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-s*1.85,0); ctx.lineTo(-s*2.65,-s*0.85); ctx.lineTo(-s*2.65,s*0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.22;
      ctx.beginPath(); ctx.moveTo(-s*1.7,-s*0.35); ctx.bezierCurveTo(-s*0.8,-s*1.55,s*0.5,-s*1.6,s*1.2,-s*1.25); ctx.stroke();
      ctx.fillStyle = 'rgba(120,90,40,0.28)';
      [[s*0.2,s*0.15,s*0.26],[-s*0.7,-s*0.25,s*0.2],[s*0.9,s*0.3,s*0.18]].forEach(([x,y,r])=>{
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s*0.55,-s*1.0,s*0.27,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*1.1,-s*0.85,s*0.27,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath(); ctx.arc(s*0.6,-s*1.0,s*0.13,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*1.15,-s*0.85,s*0.13,0,Math.PI*2); ctx.fill();
    },

    // 章魚 — round mantle, 4 curved tentacles, large eyes
    octopus(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(0, -s*0.35, s*1.15, s*0.95, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.32; ctx.lineCap = 'round';
      [[-s*0.8,s*0.5,-s*1.15,s*1.55,-s*0.55,s*2.1],
       [-s*0.28,s*0.55,-s*0.42,s*1.75,s*0.0,s*2.2],
       [s*0.28,s*0.55,s*0.42,s*1.75,s*0.0,s*2.2],
       [s*0.8,s*0.5,s*1.15,s*1.55,s*0.55,s*2.1]].forEach(([x1,y1,x2,y2,x3,y3])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.bezierCurveTo(x2,y2,x2,y2,x3,y3); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-s*0.42,-s*0.5,s*0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.42,-s*0.5,s*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath(); ctx.arc(-s*0.42,-s*0.5,s*0.15,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.42,-s*0.5,s*0.15,0,Math.PI*2); ctx.fill();
    },

    // 鮪魚 — torpedo body, lunate tail, yellow finlets
    tuna(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*2.1,0);
      ctx.bezierCurveTo(s*2.1,-s*0.95,-s*1.0,-s*1.05,-s*2.0,0);
      ctx.bezierCurveTo(-s*1.0,s*1.05,s*2.1,s*0.95,s*2.1,0);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*2.0,0); ctx.lineTo(-s*3.1,-s*1.2); ctx.lineTo(-s*2.55,0); ctx.lineTo(-s*3.1,s*1.2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(s*0.1,-s*1.05); ctx.lineTo(s*0.9,-s*1.75); ctx.lineTo(s*1.5,-s*1.05); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd700';
      for (let i=0; i<4; i++) {
        const fx = -s*1.15 - i*s*0.24;
        ctx.beginPath(); ctx.arc(fx,-s*0.88,s*0.14,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx, s*0.88,s*0.14,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.5,-s*0.2,s*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.55,-s*0.2,s*0.15,0,Math.PI*2); ctx.fill();
    },

    // 旗魚 — long bill, high dorsal fin
    swordfish(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*2.4,0);
      ctx.bezierCurveTo(s*2.4,-s*0.75,-s*1.5,-s*0.85,-s*2.3,0);
      ctx.bezierCurveTo(-s*1.5,s*0.85,s*2.4,s*0.75,s*2.4,0);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.32; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(s*2.4,-s*0.12); ctx.lineTo(s*4.0,s*0.05); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-s*0.4,-s*0.85); ctx.lineTo(s*0.5,-s*2.2); ctx.lineTo(s*1.7,-s*1.55); ctx.lineTo(s*2.1,-s*0.85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*2.3,0); ctx.lineTo(-s*3.3,-s*1.1); ctx.lineTo(-s*3.3,s*1.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,130,200,0.55)'; ctx.lineWidth = s*0.14;
      ctx.beginPath(); ctx.moveTo(-s*2.0,s*0.2); ctx.lineTo(s*1.8,s*0.0); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.9,-s*0.2,s*0.27,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.95,-s*0.2,s*0.13,0,Math.PI*2); ctx.fill();
    },

    // 鯊魚 — triangular dorsal, pointed snout, gill slits
    shark(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*2.4,0);
      ctx.bezierCurveTo(s*2.4,-s*0.6,s*0.2,-s*0.95,-s*1.8,-s*0.25);
      ctx.lineTo(-s*2.7,0);
      ctx.lineTo(-s*1.8,s*0.65);
      ctx.bezierCurveTo(s*0.2,s*0.95,s*2.4,s*0.6,s*2.4,0);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(s*0.2,-s*0.95); ctx.lineTo(s*0.85,-s*2.2); ctx.lineTo(s*1.55,-s*0.95); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.7,s*0.88); ctx.lineTo(s*1.75,s*1.75); ctx.lineTo(s*0.1,s*0.95); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s*2.7,0); ctx.lineTo(-s*3.75,-s*1.25); ctx.lineTo(-s*3.15,0); ctx.lineTo(-s*3.5,s*0.75);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(200,210,220,0.45)';
      ctx.beginPath(); ctx.ellipse(s*1.2,s*0.1,s*1.0,s*0.35,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(50,60,70,0.55)'; ctx.lineWidth = s*0.1;
      for (let i=0;i<3;i++) {
        const gx = s*1.6 - i*s*0.35;
        ctx.beginPath(); ctx.moveTo(gx,-s*0.5); ctx.lineTo(gx-s*0.1,s*0.4); ctx.stroke();
      }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.9,-s*0.25,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.95,-s*0.25,s*0.14,0,Math.PI*2); ctx.fill();
    },

    // 鯉魚 — round golden body, arched back, barbels, scales
    carp(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*1.9, 0);
      ctx.bezierCurveTo(s*1.9,-s*1.1,-s*1.2,-s*1.0,-s*1.75, 0);
      ctx.bezierCurveTo(-s*1.2, s*0.9, s*1.9, s*1.1, s*1.9, 0);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.75,0); ctx.lineTo(-s*2.7,-s*1.0); ctx.lineTo(-s*2.7,s*1.0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(160,100,15,0.38)'; ctx.lineWidth = s*0.15;
      for (let i=0; i<3; i++) for (let j=0; j<2; j++) {
        ctx.beginPath(); ctx.arc(-s*0.55+i*s*0.68, -s*0.18+j*s*0.55, s*0.42, Math.PI*0.12, Math.PI*0.88); ctx.stroke();
      }
      ctx.strokeStyle = color; ctx.lineWidth = s*0.16; ctx.lineCap = 'round';
      [[s*1.8,-s*0.12,s*2.55,-s*0.6],[s*1.8,s*0.12,s*2.55,s*0.45]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-s*0.2,-s*1.0); ctx.lineTo(s*0.5,-s*1.85); ctx.lineTo(s*1.15,-s*1.0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.3,-s*0.25,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.36,-s*0.25,s*0.14,0,Math.PI*2); ctx.fill();
    },

    // 鱒魚 — streamlined olive green, dark spots, adipose fin
    trout(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(s*2.0, 0);
      ctx.bezierCurveTo(s*2.0,-s*0.82,-s*1.4,-s*0.92,-s*2.0, 0);
      ctx.bezierCurveTo(-s*1.4, s*0.92, s*2.0, s*0.82, s*2.0, 0);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*2.0,0); ctx.lineTo(-s*3.05,-s*1.05); ctx.lineTo(-s*2.62,0); ctx.lineTo(-s*3.05,s*1.05); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(30,55,15,0.48)';
      [[-s*0.2,-s*0.45,s*0.15],[s*0.5,-s*0.36,s*0.13],[s*1.1,-s*0.42,s*0.13],
       [-s*0.55,s*0.2,s*0.12],[s*0.2,s*0.3,s*0.14],[s*0.88,s*0.2,s*0.11]].forEach(([x,y,r])=>{
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(-s*1.1,-s*0.8,s*0.22,Math.PI,0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s*0.4,-s*0.9); ctx.lineTo(s*0.3,-s*1.68); ctx.lineTo(s*1.0,-s*0.9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.42,-s*0.2,s*0.27,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.48,-s*0.2,s*0.13,0,Math.PI*2); ctx.fill();
    },

    // 鰻魚 — long sinuous snake-like body
    eel(ctx, sz, color) {
      const s = sz;
      ctx.strokeStyle = color; ctx.lineWidth = s*0.58; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s*2.6, 0);
      ctx.bezierCurveTo(s*1.4,-s*0.52,-s*0.5,s*0.52,-s*1.6, 0);
      ctx.bezierCurveTo(-s*2.3,-s*0.42,-s*3.1,-s*0.18,-s*3.6, 0.1);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(210,230,165,0.32)'; ctx.lineWidth = s*0.28;
      ctx.beginPath();
      ctx.moveTo(s*2.4, 0.1);
      ctx.bezierCurveTo(s*1.4,-s*0.24,-s*0.4,s*0.26,-s*1.4, 0.1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(20,55,20,0.5)'; ctx.lineWidth = s*0.18;
      ctx.beginPath();
      ctx.moveTo(s*1.9,-s*0.3);
      ctx.bezierCurveTo(s*0.5,-s*0.66,-s*0.9,s*0.12,-s*1.9,-s*0.22);
      ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*2.15,-s*0.14,s*0.24,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*2.2,-s*0.14,s*0.12,0,Math.PI*2); ctx.fill();
    },

    // 巨鯰 — massive head, very long barbels, mottled skin
    giant_cat(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(s*2.5, 0);
      ctx.bezierCurveTo(s*2.5,-s*1.25,-s*0.8,-s*1.35,-s*2.1, 0);
      ctx.bezierCurveTo(-s*0.8, s*1.35, s*2.5, s*1.25, s*2.5, 0);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*2.1,0); ctx.lineTo(-s*3.3,-s*1.4); ctx.lineTo(-s*3.3,s*1.4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.24; ctx.lineCap = 'round';
      [[s*2.4,-s*0.28,s*3.75,-s*1.25],[s*2.5,0,s*3.95,s*0.15],
       [s*2.4,s*0.28,s*3.75,s*1.25],[s*2.25,-s*0.55,s*3.5,-s*1.9],[s*2.25,s*0.55,s*3.5,s*1.9]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(s*0.3,-s*1.35); ctx.lineTo(s*1.0,-s*2.3); ctx.lineTo(s*1.85,-s*1.35); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(80,50,20,0.3)';
      [[s*0.0,-s*0.2,s*0.46],[s*1.1,s*0.3,s*0.36],[-s*0.8,s*0.45,s*0.3]].forEach(([x,y,r])=>{
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.55,-s*0.42,s*0.34,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(s*1.62,-s*0.42,s*0.17,0,Math.PI*2); ctx.fill();
    },

    // 龍魚 — serpentine gold body, whiskers, ornate fins
    dragon(ctx, sz, color) {
      const s = sz;
      // S-curve body (thick stroke)
      ctx.strokeStyle = color; ctx.lineWidth = s*0.65; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s*2.3,-s*0.3);
      ctx.bezierCurveTo(s*1.5,-s*0.9,-s*0.5,s*0.8,-s*1.5,s*0.25);
      ctx.bezierCurveTo(-s*2.2,-s*0.25,-s*2.8,-s*0.3,-s*3.2,0);
      ctx.stroke();
      ctx.lineCap = 'butt';
      // Ornate dorsal fins
      ctx.fillStyle = 'rgba(255,220,0,0.8)';
      [[s*1.6,-s*0.6],[s*0.4,-s*0.7],[-s*0.8,s*0.3]].forEach(([fx,fy])=>{
        ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx-s*0.2,fy-s*1.1); ctx.lineTo(fx-s*0.55,fy); ctx.closePath(); ctx.fill();
      });
      // Scale highlights
      ctx.fillStyle = 'rgba(255,200,0,0.5)';
      [[s*1.9,-s*0.35],[s*0.75,-s*0.6],[-s*0.05,s*0.45],[-s*1.1,s*0.25]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.arc(x,y,s*0.22,0,Math.PI*2); ctx.fill();
      });
      // Gold whiskers
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = s*0.12; ctx.lineCap = 'round';
      [[s*2.3,-s*0.3,s*3.1,-s*1.0],[s*2.3,-s*0.3,s*3.1,s*0.35]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      // Red eye
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*2.05,-s*0.38,s*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#cc0000'; ctx.beginPath(); ctx.arc(s*2.1,-s*0.38,s*0.15,0,Math.PI*2); ctx.fill();
    },
  },

  // ── Rod sprites ─────────────────────────────────────────────────────
  // ctx is pre-translated/rotated; rod runs from (0,0) to (len,0)

  _rod: {

    // 木製釣竿 — brown wooden stick with grip wrapping
    wood(ctx, len) {
      const g = ctx.createLinearGradient(0,0,len,0);
      g.addColorStop(0,'#6b4c1e'); g.addColorStop(0.35,'#8b6914'); g.addColorStop(1,'#5a3a0a');
      ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.88,0); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(len*0.88,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = '#3a2005'; ctx.lineWidth = 1.2;
      for (let i=2; i<=len*0.28; i+=3.5) {
        ctx.beginPath(); ctx.moveTo(i,-2); ctx.lineTo(i,2); ctx.stroke();
      }
    },

    // 鐵製釣竿 — silver-gray metallic with rings
    iron(ctx, len) {
      ctx.strokeStyle = '#b0b8c0'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.88,0); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(len*0.88,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(220,230,255,0.45)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(2,-1); ctx.lineTo(len*0.82,-1); ctx.stroke();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5;
      [0.25,0.45,0.65,0.82].forEach(p=>{
        ctx.beginPath(); ctx.arc(len*p,0,2.5,0,Math.PI*2); ctx.stroke();
      });
      ctx.strokeStyle = '#222'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.18,0); ctx.stroke();
    },

    // 碳纖釣竿 — matte black with red grip and fine rings
    carbon(ctx, len) {
      ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.9,0); ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(len*0.9,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(60,60,60,0.55)'; ctx.lineWidth = 0.8;
      for (let i=4; i<len*0.85; i+=5) {
        ctx.beginPath(); ctx.moveTo(i,-2); ctx.lineTo(i+2,2); ctx.stroke();
      }
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1.4;
      [0.2,0.38,0.54,0.68,0.80,0.90].forEach(p=>{
        ctx.beginPath(); ctx.arc(len*p,0,2,0,Math.PI*2); ctx.stroke();
      });
      ctx.strokeStyle = '#cc2222'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.16,0); ctx.stroke();
    },

    // 大師釣竿 — golden with gem tip
    master(ctx, len) {
      const g = ctx.createLinearGradient(0,0,len,0);
      g.addColorStop(0,'#b8860b'); g.addColorStop(0.5,'#ffd700'); g.addColorStop(1,'#daa520');
      ctx.strokeStyle = g; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.9,0); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(len*0.9,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.arc(len,0,3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2;
      [0.2,0.38,0.55,0.70,0.84].forEach(p=>{
        ctx.beginPath(); ctx.arc(len*p,0,3,0,Math.PI*2); ctx.stroke();
      });
      ctx.strokeStyle = '#7a5000'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.2,0); ctx.stroke();
    },

    // 傳說釣竿 — purple glow with arcane rings
    legend(ctx, len) {
      ctx.shadowColor = '#8866ff'; ctx.shadowBlur = 7;
      ctx.strokeStyle = '#6644cc'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.9,0); ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(len*0.9,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#ccaaff'; ctx.shadowColor = '#aaaaff'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(len,0,3.5,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#9977ee'; ctx.lineWidth = 2;
      [0.22,0.42,0.60,0.76,0.88].forEach(p=>{
        ctx.beginPath(); ctx.arc(len*p,0,2.8,0,Math.PI*2); ctx.stroke();
      });
      ctx.strokeStyle = '#220044'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.18,0); ctx.stroke();
    },

    // 深海釣竿 — dark teal with cyan glow tip
    deep(ctx, len) {
      const g = ctx.createLinearGradient(0,0,len,0);
      g.addColorStop(0,'#003344'); g.addColorStop(0.5,'#006677'); g.addColorStop(1,'#00aacc');
      ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.88,0); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(len*0.88,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#00ddff'; ctx.shadowColor = '#00aacc'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(len,0,3,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#88ccdd'; ctx.lineWidth = 2;
      [0.18,0.35,0.50,0.64,0.77,0.88].forEach(p=>{
        ctx.beginPath(); ctx.arc(len*p,0,3.5,0,Math.PI*2); ctx.stroke();
      });
      ctx.strokeStyle = '#002233'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.2,0); ctx.stroke();
    },

    // 神器釣竿 — rainbow cycling color with star tip
    divine(ctx, len) {
      const hue = (Date.now() / 28) % 360;
      ctx.shadowColor = `hsl(${hue},100%,70%)`; ctx.shadowBlur = 10;
      ctx.strokeStyle = `hsl(${hue},100%,65%)`; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.9,0); ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(len*0.9,0); ctx.lineTo(len,0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 8;
      sprites._star(ctx, len, 0, 4);
      ctx.shadowBlur = 0;
      [0.20,0.38,0.54,0.68,0.80,0.90].forEach((p,i)=>{
        ctx.strokeStyle = `hsl(${(hue+i*40)%360},100%,65%)`; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(len*p,0,3.5,0,Math.PI*2); ctx.stroke();
      });
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len*0.2,0); ctx.stroke();
    },
  },

  _star(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i=0; i<5; i++) {
      const a  = Math.PI/2.5*i - Math.PI/2;
      const ai = a + Math.PI/5;
      if (i===0) ctx.moveTo(cx+r*Math.cos(a), cy+r*Math.sin(a));
      else        ctx.lineTo(cx+r*Math.cos(a), cy+r*Math.sin(a));
      ctx.lineTo(cx+r*0.42*Math.cos(ai), cy+r*0.42*Math.sin(ai));
    }
    ctx.closePath(); ctx.fill();
  },
};
