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

    // 月亮魚 — round disc body, tall fins, moon-glow shimmer
    moonfish(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = 'rgba(180,225,255,0.18)';
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.85, s*1.75, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(100,170,220,0.4)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.45, s*1.35, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(220,245,255,0.38)';
      ctx.beginPath(); ctx.ellipse(-s*0.2,-s*0.25,s*0.85,s*0.75,0.25,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(100,170,220,0.4)';
      ctx.beginPath(); ctx.moveTo(-s*0.35,-s*1.35); ctx.lineTo(s*0.05,-s*2.5); ctx.lineTo(s*0.5,-s*1.35); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.35,s*1.35); ctx.lineTo(s*0.05,s*2.35); ctx.lineTo(s*0.5,s*1.35); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.4,-s*0.1); ctx.lineTo(-s*2.0,-s*0.7); ctx.lineTo(-s*2.0,s*0.7); ctx.lineTo(-s*1.4,s*0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.beginPath(); ctx.ellipse(s*0.3,-s*0.42,s*0.38,s*0.26,-0.4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*0.92,-s*0.18,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a3a'; ctx.beginPath(); ctx.arc(s*0.97,-s*0.18,s*0.14,0,Math.PI*2); ctx.fill();
    },

    // 水晶鰻 — crystalline sinuous body with gem facets
    crystal_eel(ctx, sz, color) {
      const s = sz;
      ctx.strokeStyle = color; ctx.lineWidth = s*0.55; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s*2.6,0);
      ctx.bezierCurveTo(s*1.4,-s*0.5,-s*0.5,s*0.5,-s*1.6,0);
      ctx.bezierCurveTo(-s*2.3,-s*0.4,-s*3.1,-s*0.18,-s*3.6,0.1);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(200,255,245,0.68)'; ctx.lineWidth = s*0.22;
      ctx.beginPath();
      ctx.moveTo(s*2.45,0);
      ctx.bezierCurveTo(s*1.4,-s*0.22,-s*0.4,s*0.24,-s*1.45,0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(160,255,230,0.48)';
      [[s*1.85,-s*0.1],[s*0.65,-s*0.28],[-s*0.45,s*0.22],[-s*1.5,-s*0.08]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+s*0.22,y-s*0.34); ctx.lineTo(x+s*0.44,y); ctx.lineTo(x+s*0.22,y+s*0.28); ctx.closePath(); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(100,220,200,0.55)'; ctx.lineWidth = s*0.14;
      ctx.beginPath(); ctx.moveTo(s*1.6,-s*0.35); ctx.lineTo(s*2.0,-s*0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.4,s*0.32); ctx.lineTo(s*0.6,s*0.75); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*2.18,-s*0.13,s*0.25,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#00bbdd'; ctx.beginPath(); ctx.arc(s*2.23,-s*0.13,s*0.12,0,Math.PI*2); ctx.fill();
    },

    // 靈鯉 — spirit carp, sakura-pink with ethereal glow trails
    spirit_carp(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = 'rgba(255,150,205,0.2)';
      ctx.beginPath(); ctx.ellipse(0,0,s*2.35,s*1.45,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(200,70,145,0.35)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*1.9,0);
      ctx.bezierCurveTo(s*1.9,-s*1.1,-s*1.2,-s*1.0,-s*1.75,0);
      ctx.bezierCurveTo(-s*1.2,s*0.9,s*1.9,s*1.1,s*1.9,0);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.75,0); ctx.lineTo(-s*2.7,-s*1.0); ctx.lineTo(-s*2.7,s*1.0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,110,175,0.38)'; ctx.lineWidth = s*0.15;
      for (let i=0; i<3; i++) for (let j=0; j<2; j++) {
        ctx.beginPath(); ctx.arc(-s*0.55+i*s*0.68,-s*0.18+j*s*0.55,s*0.42,Math.PI*0.12,Math.PI*0.88); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,200,230,0.6)';
      [[-s*0.6,-s*1.45,s*0.14],[s*0.2,-s*1.55,s*0.11],[s*1.0,-s*1.35,s*0.1]].forEach(([x,y,r])=>{
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-s*0.2,-s*1.0); ctx.lineTo(s*0.5,-s*1.85); ctx.lineTo(s*1.15,-s*1.0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,170,215,0.9)'; ctx.lineWidth = s*0.14; ctx.lineCap = 'round';
      [[s*1.85,-s*0.12,s*2.62,-s*0.58],[s*1.85,s*0.12,s*2.62,s*0.48]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.3,-s*0.25,s*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#cc44aa'; ctx.beginPath(); ctx.arc(s*1.36,-s*0.25,s*0.15,0,Math.PI*2); ctx.fill();
    },

    // 虛空魷 — void squid, dark purple mantle with glowing eyes and void tendrils
    void_squid(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = 'rgba(90,20,170,0.2)';
      ctx.beginPath(); ctx.ellipse(0,-s*0.55,s*1.65,s*1.35,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(55,0,110,0.45)'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0,-s*1.35);
      ctx.bezierCurveTo(s*1.25,-s*1.35,s*1.25,-s*0.15,s*0.85,s*0.35);
      ctx.lineTo(0,s*0.65); ctx.lineTo(-s*0.85,s*0.35);
      ctx.bezierCurveTo(-s*1.25,-s*0.15,-s*1.25,-s*1.35,0,-s*1.35);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-s*0.5,-s*1.35); ctx.lineTo(-s*1.05,-s*2.05); ctx.lineTo(-s*0.02,-s*1.45); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*0.5,-s*1.35); ctx.lineTo(s*1.05,-s*2.05); ctx.lineTo(s*0.02,-s*1.45); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.27; ctx.lineCap = 'round';
      [[-s*0.78,s*0.5,-s*1.12,s*1.5,-s*0.58,s*2.1],
       [-s*0.28,s*0.56,-s*0.44,s*1.8,0,s*2.3],
       [s*0.28,s*0.56,s*0.44,s*1.8,0,s*2.3],
       [s*0.78,s*0.5,s*1.12,s*1.5,s*0.58,s*2.1]].forEach(([x1,y1,x2,y2,x3,y3])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.bezierCurveTo(x2,y2,x2,y2,x3,y3); ctx.stroke();
      });
      ctx.lineWidth = s*0.15;
      [[-s*0.58,s*0.52,-s*1.5,s*2.35],[-s*0.08,s*0.62,0.1,s*2.85],[s*0.6,s*0.52,s*1.5,s*2.35]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo((x1+x2)/2+s*0.28,y1+(y2-y1)*0.5,x2,y2); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.fillStyle = 'rgba(210,155,255,0.95)';
      ctx.beginPath(); ctx.arc(-s*0.38,-s*0.52,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.38,-s*0.52,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a0030';
      ctx.beginPath(); ctx.arc(-s*0.38,-s*0.52,s*0.13,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.38,-s*0.52,s*0.13,0,Math.PI*2); ctx.fill();
    },

    // 深海旗魚 — dark blue billfish with bioluminescent stripe
    deep_marlin(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,55,0.45)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*2.4,0);
      ctx.bezierCurveTo(s*2.4,-s*0.75,-s*1.5,-s*0.85,-s*2.3,0);
      ctx.bezierCurveTo(-s*1.5,s*0.85,s*2.4,s*0.75,s*2.4,0);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.30; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(s*2.4,-s*0.1); ctx.lineTo(s*4.2,s*0.05); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-s*0.4,-s*0.85); ctx.lineTo(s*0.4,-s*2.4); ctx.lineTo(s*1.8,-s*1.6); ctx.lineTo(s*2.2,-s*0.85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*2.3,0); ctx.lineTo(-s*3.3,-s*1.1); ctx.lineTo(-s*3.3,s*1.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,175,255,0.78)'; ctx.lineWidth = s*0.15;
      ctx.beginPath(); ctx.moveTo(-s*2.0,s*0.18); ctx.lineTo(s*1.8,0); ctx.stroke();
      ctx.fillStyle = 'rgba(75,135,220,0.48)';
      ctx.beginPath(); ctx.ellipse(s*0.5,s*0.55,s*0.48,s*0.2,-0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*1.9,-s*0.2,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#001133'; ctx.beginPath(); ctx.arc(s*1.95,-s*0.2,s*0.14,0,Math.PI*2); ctx.fill();
    },

    // 深淵鯊 — near-black abyss shark with pale belly and photophores
    abyss_shark(ctx, sz, color) {
      const s = sz;
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,18,0.55)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(s*2.4,0);
      ctx.bezierCurveTo(s*2.4,-s*0.6,s*0.2,-s*0.95,-s*1.8,-s*0.25);
      ctx.lineTo(-s*2.7,0); ctx.lineTo(-s*1.8,s*0.65);
      ctx.bezierCurveTo(s*0.2,s*0.95,s*2.4,s*0.6,s*2.4,0);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(75,100,130,0.48)';
      ctx.beginPath(); ctx.ellipse(s*0.8,s*0.18,s*1.1,s*0.36,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(s*0.2,-s*0.95); ctx.lineTo(s*0.85,-s*2.45); ctx.lineTo(s*1.55,-s*0.95); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.7,s*0.88); ctx.lineTo(s*1.75,s*1.88); ctx.lineTo(s*0.1,s*0.95); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s*2.7,0); ctx.lineTo(-s*3.8,-s*1.3); ctx.lineTo(-s*3.15,0); ctx.lineTo(-s*3.55,s*0.8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(95,158,255,0.78)';
      [s*0.3,s*0.78,s*1.28,s*1.72,-s*0.18].forEach((x,i)=>{
        ctx.beginPath(); ctx.arc(x,s*0.12+Math.sin(i)*s*0.1,s*0.085,0,Math.PI*2); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(18,28,48,0.68)'; ctx.lineWidth = s*0.1;
      for (let i=0;i<3;i++) {
        const gx = s*1.6 - i*s*0.35;
        ctx.beginPath(); ctx.moveTo(gx,-s*0.5); ctx.lineTo(gx-s*0.1,s*0.4); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(95,175,255,0.92)'; ctx.beginPath(); ctx.arc(s*1.9,-s*0.25,s*0.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000820'; ctx.beginPath(); ctx.arc(s*1.95,-s*0.25,s*0.14,0,Math.PI*2); ctx.fill();
    },

    // 海龍 — azure sea dragon, serpentine with webbed fins and leaf appendages
    sea_dragon(ctx, sz, color) {
      const s = sz;
      ctx.strokeStyle = 'rgba(70,195,255,0.14)'; ctx.lineWidth = s*1.15; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s*2.3,-s*0.3);
      ctx.bezierCurveTo(s*1.5,-s*0.9,-s*0.5,s*0.8,-s*1.5,s*0.25);
      ctx.bezierCurveTo(-s*2.2,-s*0.25,-s*2.8,-s*0.3,-s*3.2,0);
      ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.62;
      ctx.beginPath();
      ctx.moveTo(s*2.3,-s*0.3);
      ctx.bezierCurveTo(s*1.5,-s*0.9,-s*0.5,s*0.8,-s*1.5,s*0.25);
      ctx.bezierCurveTo(-s*2.2,-s*0.25,-s*2.8,-s*0.3,-s*3.2,0);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = 'rgba(115,215,255,0.72)';
      [[s*1.6,-s*0.6],[s*0.3,-s*0.65],[-s*0.85,s*0.28]].forEach(([fx,fy])=>{
        ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx-s*0.15,fy-s*1.3); ctx.lineTo(fx-s*0.5,fy); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = 'rgba(95,195,255,0.5)';
      [[s*1.0,-s*0.25],[s*0.0,s*0.35],[-s*0.9,0]].forEach(([fx,fy])=>{
        ctx.beginPath(); ctx.ellipse(fx+s*0.38,fy-s*0.5,s*0.52,s*0.2,-0.65,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = 'rgba(175,238,255,0.42)';
      [[s*1.9,-s*0.35],[s*0.7,-s*0.6],[-s*0.1,s*0.45],[-s*1.1,s*0.2]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.arc(x,y,s*0.2,0,Math.PI*2); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(175,238,255,0.9)'; ctx.lineWidth = s*0.12; ctx.lineCap = 'round';
      [[s*2.3,-s*0.3,s*3.2,-s*1.1],[s*2.3,-s*0.3,s*3.2,s*0.4]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s*2.05,-s*0.38,s*0.32,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#00ccff'; ctx.beginPath(); ctx.arc(s*2.1,-s*0.38,s*0.16,0,Math.PI*2); ctx.fill();
    },
  },

  // ── Rod sprites ─────────────────────────────────────────────────────
  // ctx is pre-translated/rotated; rod runs from (0,0) to (len,0)

  _rod: {

    // 木製釣竿 — 錐形木身、軟木握把、黃銅導環
    wood(ctx, len) {
      const L = len;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 主體（錐形）
      const bg = ctx.createLinearGradient(0,-3.5,0,3.5);
      bg.addColorStop(0,'#7a5520'); bg.addColorStop(0.4,'#a07828'); bg.addColorStop(1,'#5a3810');
      ctx.fillStyle = bg; poly(L*0.20,L*0.92,3.8,0.85); ctx.fill();
      // 木紋
      ctx.strokeStyle = 'rgba(55,28,5,0.22)'; ctx.lineWidth = 0.7;
      for (let i=0.28; i<0.88; i+=0.14) {
        const r = 3.4*(1-i*0.88);
        ctx.beginPath(); ctx.moveTo(L*i,-r); ctx.lineTo(L*(i+0.06),-r*0.68); ctx.stroke();
      }
      // 亮面反光
      ctx.fillStyle = 'rgba(200,160,70,0.32)'; poly(L*0.22,L*0.90,1.0,0.28); ctx.fill();
      // 軟木握把
      const cg = ctx.createLinearGradient(0,-4.8,0,4.8);
      cg.addColorStop(0,'#d2b48c'); cg.addColorStop(0.5,'#c8a47c'); cg.addColorStop(1,'#b89068');
      ctx.fillStyle = cg; poly(0,L*0.20,4.8,3.8); ctx.fill();
      ctx.fillStyle = 'rgba(130,90,50,0.2)';
      for (let x=5; x<L*0.17; x+=6.5) {
        ctx.beginPath(); ctx.arc(x,-1.4,1.1,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+3.2,1.6,0.9,0,Math.PI*2); ctx.fill();
      }
      ctx.strokeStyle = '#7a5030'; ctx.lineWidth = 1.0;
      [0.06,0.12,0.18].forEach(p => { ctx.beginPath(); ctx.moveTo(L*p,-4.8); ctx.lineTo(L*p,4.8); ctx.stroke(); });
      // 捲線座
      ctx.fillStyle = '#2e1a06'; poly(L*0.19,L*0.27,5.2,3.8); ctx.fill();
      ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 0.9;
      [L*0.21,L*0.25].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-5.2); ctx.lineTo(x,5.2); ctx.stroke(); });
      // 導環（黃銅弧形）
      ctx.strokeStyle = '#c8a020'; ctx.lineWidth = 1.2;
      [[0.36,4.2,2.3],[0.52,3.6,2.0],[0.66,3.0,1.7],[0.80,2.3,1.3]].forEach(([p,h,r]) => {
        const x = L*p;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.62,-0.35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.62,-0.35); ctx.stroke();
        ctx.lineWidth=1.2;
      });
      // 竿尖
      ctx.strokeStyle = '#5a3810'; ctx.lineWidth = 0.85; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.92,0); ctx.lineTo(L,0); ctx.stroke();
      ctx.lineCap = 'butt';
    },

    // 鐵製釣竿 — 金屬漸層身體、黑橡膠握把、鉻導環
    iron(ctx, len) {
      const L = len;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 主體
      const bg = ctx.createLinearGradient(0,-3.5,0,3.5);
      bg.addColorStop(0,'#9098a0'); bg.addColorStop(0.35,'#d8e0e8'); bg.addColorStop(0.65,'#b0b8c0'); bg.addColorStop(1,'#808890');
      ctx.fillStyle = bg; poly(L*0.22,L*0.92,3.5,0.75); ctx.fill();
      ctx.fillStyle = 'rgba(240,248,255,0.45)'; poly(L*0.24,L*0.90,0.95,0.22); ctx.fill();
      // 黑橡膠握把
      const gg = ctx.createLinearGradient(0,-4.8,0,4.8);
      gg.addColorStop(0,'#282828'); gg.addColorStop(0.5,'#363636'); gg.addColorStop(1,'#181818');
      ctx.fillStyle = gg; poly(0,L*0.22,4.8,3.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; poly(0,L*0.20,1.0,0.8); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.9;
      for (let x=4; x<L*0.20; x+=5) { ctx.beginPath(); ctx.moveTo(x,-4.8); ctx.lineTo(x,4.8); ctx.stroke(); }
      // 捲線座（鉻）
      const rs = ctx.createLinearGradient(0,-5.5,0,5.5);
      rs.addColorStop(0,'#8898a8'); rs.addColorStop(0.45,'#e0e8f0'); rs.addColorStop(1,'#7888a0');
      ctx.fillStyle = rs; poly(L*0.21,L*0.30,5.5,3.5); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(L*0.22,-5.2); ctx.lineTo(L*0.29,-3.2); ctx.stroke();
      // 導環（鉻弧形）
      [[0.36,3.8,2.0],[0.49,3.3,1.8],[0.62,2.8,1.5],[0.74,2.3,1.2],[0.86,1.8,0.95]].forEach(([p,h,r]) => {
        const x = L*p;
        const rg = ctx.createLinearGradient(x-r,-h,x+r,-h+r*2);
        rg.addColorStop(0,'#c8d0d8'); rg.addColorStop(0.5,'#ffffff'); rg.addColorStop(1,'#8898a8');
        ctx.strokeStyle = rg; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.strokeStyle = '#9098a8'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.6,-0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.6,-0.3); ctx.stroke();
      });
      // 竿尖
      ctx.strokeStyle = '#9098a8'; ctx.lineWidth = 0.85; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.92,0); ctx.lineTo(L,0); ctx.stroke();
      ctx.lineCap = 'butt';
    },

    // 碳纖釣竿 — 輕量黑體碳織紋、紅色 EVA 握把、鈦導環
    carbon(ctx, len) {
      const L = len;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 消光黑主體
      ctx.fillStyle = '#1a1a1c'; poly(L*0.20,L*0.92,3.2,0.65); ctx.fill();
      // 碳纖維斜紋
      ctx.strokeStyle = 'rgba(48,48,54,0.6)'; ctx.lineWidth = 0.65;
      for (let x=L*0.22; x<L*0.90; x+=5) {
        const r = Math.max(0.65, 3.2*(1-(x-L*0.20)/(L*0.72)));
        ctx.beginPath(); ctx.moveTo(x,-r); ctx.lineTo(x+3.5,r); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+3.5,-r); ctx.lineTo(x,r); ctx.stroke();
      }
      // 細亮線
      ctx.fillStyle = 'rgba(90,90,105,0.28)'; poly(L*0.22,L*0.90,0.75,0.18); ctx.fill();
      // 紅 EVA 握把
      const gg = ctx.createLinearGradient(0,-4.5,0,4.5);
      gg.addColorStop(0,'#bb1818'); gg.addColorStop(0.5,'#dd2020'); gg.addColorStop(1,'#991010');
      ctx.fillStyle = gg; poly(0,L*0.20,4.5,3.2); ctx.fill();
      ctx.fillStyle = 'rgba(255,80,80,0.22)'; poly(0,L*0.18,0.95,0.75); ctx.fill();
      ctx.strokeStyle = 'rgba(70,0,0,0.4)'; ctx.lineWidth = 0.9;
      for (let x=4; x<L*0.18; x+=4.5) { ctx.beginPath(); ctx.moveTo(x,-4.5); ctx.lineTo(x,4.5); ctx.stroke(); }
      // 捲線座（黑底紅線）
      ctx.fillStyle = '#111114'; poly(L*0.19,L*0.27,5.0,3.2); ctx.fill();
      ctx.strokeStyle = '#cc2222'; ctx.lineWidth = 0.85;
      [L*0.205,L*0.255].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-5); ctx.lineTo(x,5); ctx.stroke(); });
      // 鈦導環（細、暗）
      ctx.lineWidth = 1.0;
      [[0.33,3.0,1.7],[0.45,2.6,1.5],[0.56,2.2,1.3],[0.67,1.9,1.1],[0.78,1.5,0.9],[0.88,1.1,0.68]].forEach(([p,h,r]) => {
        const x = L*p;
        ctx.strokeStyle = '#88889a'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.strokeStyle = '#666678'; ctx.lineWidth = 0.75;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.55,-0.28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.55,-0.28); ctx.stroke();
      });
      // 竿尖
      ctx.strokeStyle = '#333338'; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.92,0); ctx.lineTo(L,0); ctx.stroke();
      ctx.lineCap = 'butt';
    },

    // 大師釣竿 — 黃金光澤、桃花心木握把、鍍金導環
    master(ctx, len) {
      const L = len;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 金色主體
      const bg = ctx.createLinearGradient(0,-3.6,0,3.6);
      bg.addColorStop(0,'#b8880a'); bg.addColorStop(0.35,'#ffd700'); bg.addColorStop(0.65,'#e8bc00'); bg.addColorStop(1,'#a07800');
      ctx.fillStyle = bg; poly(L*0.20,L*0.92,3.6,0.82); ctx.fill();
      // 閃光
      ctx.fillStyle = 'rgba(255,248,180,0.42)'; poly(L*0.22,L*0.90,1.05,0.28); ctx.fill();
      // 雕刻紋
      ctx.strokeStyle = 'rgba(130,85,0,0.3)'; ctx.lineWidth = 0.7;
      for (let i=0.28; i<0.88; i+=0.10) {
        const r = 3.2*(1-i*0.88);
        ctx.beginPath(); ctx.moveTo(L*i,r*0.35); ctx.lineTo(L*(i+0.05),r*0.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(L*i,-r*0.38); ctx.lineTo(L*(i+0.04),-r*0.65); ctx.stroke();
      }
      // 桃花心木握把
      const mhg = ctx.createLinearGradient(0,-4.8,0,4.8);
      mhg.addColorStop(0,'#551a00'); mhg.addColorStop(0.5,'#7a2808'); mhg.addColorStop(1,'#441200');
      ctx.fillStyle = mhg; poly(0,L*0.20,4.8,3.6); ctx.fill();
      ctx.strokeStyle = '#c8a020'; ctx.lineWidth = 1.5;
      [0.04,0.09,0.15,0.19].forEach(p => { ctx.beginPath(); ctx.moveTo(L*p,-4.8); ctx.lineTo(L*p,4.8); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(255,220,100,0.38)'; ctx.lineWidth = 0.6;
      [0.04,0.09,0.15,0.19].forEach(p => { ctx.beginPath(); ctx.moveTo(L*p-0.6,-4.8); ctx.lineTo(L*p-0.6,4.8); ctx.stroke(); });
      // 捲線座（黑底金邊）
      ctx.fillStyle = '#2a1500'; poly(L*0.19,L*0.29,5.2,3.6); ctx.fill();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.1;
      [L*0.21,L*0.27].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-5.2); ctx.lineTo(x,5.2); ctx.stroke(); });
      // 鍍金導環（弧心有金點）
      [[0.36,4.0,2.2],[0.50,3.5,1.9],[0.63,2.9,1.6],[0.75,2.4,1.3],[0.86,1.8,1.0]].forEach(([p,h,r]) => {
        const x = L*p;
        ctx.strokeStyle = '#c8a020'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.strokeStyle = '#a08010'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.6,-0.32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.6,-0.32); ctx.stroke();
        ctx.fillStyle = 'rgba(255,228,45,0.68)';
        ctx.beginPath(); ctx.arc(x,-h+r,r*0.36,0,Math.PI*2); ctx.fill();
      });
      // 寶石竿尖
      ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(L,0,3.2,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#a07800'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.92,0); ctx.lineTo(L-3,0); ctx.stroke();
      ctx.lineCap = 'butt';
    },

    // 傳說釣竿 — 深紫光暈身體、符文刻紋、奧術發光導環
    legend(ctx, len) {
      const L = len;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 深紫主體（微發光）
      ctx.shadowColor = '#7755cc'; ctx.shadowBlur = 5;
      const bg = ctx.createLinearGradient(0,-3.6,0,3.6);
      bg.addColorStop(0,'#3a2088'); bg.addColorStop(0.4,'#6644cc'); bg.addColorStop(1,'#1e1055');
      ctx.fillStyle = bg; poly(L*0.20,L*0.92,3.6,0.82); ctx.fill();
      ctx.shadowBlur = 0;
      // 內部光暈
      ctx.fillStyle = 'rgba(180,140,255,0.32)'; poly(L*0.22,L*0.90,1.15,0.28); ctx.fill();
      // 符文刻紋
      ctx.strokeStyle = 'rgba(200,170,255,0.42)'; ctx.lineWidth = 0.72;
      for (let i=0.30; i<0.88; i+=0.11) {
        const r = 3.0*(1-i*0.87), x = L*i;
        ctx.beginPath(); ctx.moveTo(x,-r*0.5); ctx.lineTo(x+L*0.028,r*0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+L*0.014,r*0.5); ctx.lineTo(x+L*0.038,-r*0.3); ctx.stroke();
      }
      // 暗色握把（紫邊）
      ctx.fillStyle = '#160830'; poly(0,L*0.20,4.8,3.6); ctx.fill();
      ctx.fillStyle = 'rgba(110,80,200,0.2)'; poly(0,L*0.18,1.15,0.88); ctx.fill();
      ctx.strokeStyle = '#8866cc'; ctx.lineWidth = 1.2;
      [0.05,0.11,0.17].forEach(p => { ctx.beginPath(); ctx.moveTo(L*p,-4.8); ctx.lineTo(L*p,4.8); ctx.stroke(); });
      // 捲線座（符文刻）
      ctx.fillStyle = '#0e0618'; poly(L*0.19,L*0.28,5.2,3.6); ctx.fill();
      ctx.strokeStyle = '#9966ff'; ctx.lineWidth = 0.95;
      [L*0.21,L*0.26].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-5.2); ctx.lineTo(x,5.2); ctx.stroke(); });
      // 奧術導環（發光弧）
      [[0.36,4.0,2.2],[0.50,3.4,1.9],[0.63,2.8,1.6],[0.75,2.3,1.3],[0.86,1.7,1.0]].forEach(([p,h,r]) => {
        const x = L*p;
        ctx.shadowColor = '#aa88ff'; ctx.shadowBlur = 5;
        ctx.strokeStyle = '#cc99ff'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#9966cc'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.6,-0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.6,-0.3); ctx.stroke();
      });
      ctx.shadowBlur = 0;
      // 水晶竿尖
      ctx.fillStyle = '#ccaaff'; ctx.shadowColor = '#ccaaff'; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.arc(L,0,3.5,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#6644cc'; ctx.lineWidth = 1.0; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.92,0); ctx.lineTo(L-3.5,0); ctx.stroke();
      ctx.lineCap = 'butt';
    },

    // 深海釣竿 — 重型深藍竿體、厚橡膠握把、生物發光條紋、大型滾輪導環
    deep(ctx, len) {
      const L = len;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 厚實深藍主體
      const bg = ctx.createLinearGradient(0,-4.5,0,4.5);
      bg.addColorStop(0,'#002233'); bg.addColorStop(0.4,'#004455'); bg.addColorStop(1,'#001828');
      ctx.fillStyle = bg; poly(L*0.22,L*0.91,4.5,1.05); ctx.fill();
      // 生物發光條紋
      ctx.strokeStyle = 'rgba(0,210,230,0.65)'; ctx.lineWidth = 0.95;
      ctx.beginPath(); ctx.moveTo(L*0.24,1.8); ctx.lineTo(L*0.90,0.5); ctx.stroke();
      // 加固環帶
      ctx.strokeStyle = '#003348'; ctx.lineWidth = 2.8;
      [0.33,0.52,0.70].forEach(p => { ctx.beginPath(); ctx.moveTo(L*p,-4.5); ctx.lineTo(L*p,4.5); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(0,160,185,0.48)'; ctx.lineWidth = 0.75;
      [0.33,0.52,0.70].forEach(p => { ctx.beginPath(); ctx.moveTo(L*p,-4.2); ctx.lineTo(L*p,4.2); ctx.stroke(); });
      // 厚橡膠握把（防滑）
      const rg = ctx.createLinearGradient(0,-5.5,0,5.5);
      rg.addColorStop(0,'#182830'); rg.addColorStop(0.5,'#22363e'); rg.addColorStop(1,'#101c22');
      ctx.fillStyle = rg; poly(0,L*0.22,5.5,4.5); ctx.fill();
      ctx.fillStyle = 'rgba(0,180,200,0.11)'; poly(0,L*0.20,1.4,1.1); ctx.fill();
      ctx.strokeStyle = 'rgba(0,110,135,0.35)'; ctx.lineWidth = 1.0;
      for (let x=5; x<L*0.20; x+=5.5) { ctx.beginPath(); ctx.moveTo(x,-5.5); ctx.lineTo(x,5.5); ctx.stroke(); }
      // 重型捲線座
      const rsgrad = ctx.createLinearGradient(0,-6,0,6);
      rsgrad.addColorStop(0,'#001c2a'); rsgrad.addColorStop(0.5,'#003c55'); rsgrad.addColorStop(1,'#000e15');
      ctx.fillStyle = rsgrad; poly(L*0.21,L*0.30,6.0,4.5); ctx.fill();
      ctx.strokeStyle = '#00aacc'; ctx.lineWidth = 1.05;
      [L*0.225,L*0.285].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-6); ctx.lineTo(x,6); ctx.stroke(); });
      // 大型滾輪導環
      [[0.36,5.0,2.8],[0.49,4.3,2.4],[0.61,3.6,2.0],[0.73,3.0,1.65],[0.84,2.3,1.25]].forEach(([p,h,r]) => {
        const x = L*p;
        ctx.strokeStyle = '#335566'; ctx.lineWidth = 2.1;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.fillStyle = 'rgba(0,200,225,0.38)';
        ctx.beginPath(); ctx.arc(x,-h+r,r*0.44,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#00aacc'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.6,-0.4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.6,-0.4); ctx.stroke();
      });
      // 青光竿尖
      ctx.fillStyle = '#00ddff'; ctx.shadowColor = '#00aacc'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(L,0,3.2,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#003f55'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.91,0); ctx.lineTo(L-3,0); ctx.stroke();
      ctx.lineCap = 'butt';
    },

    // 神器釣竿 — 彩虹光體、神聖金握把、稜鏡導環、星芒竿尖
    divine(ctx, len) {
      const L = len;
      const hue = (Date.now()/25)%360;
      const poly = (x0,x1,r0,r1) => {
        ctx.beginPath();
        ctx.moveTo(x0,-r0); ctx.lineTo(x1,-r1); ctx.lineTo(x1,r1); ctx.lineTo(x0,r0);
        ctx.closePath();
      };
      // 彩虹主體（動態變色）
      ctx.shadowColor = `hsl(${hue},100%,70%)`; ctx.shadowBlur = 8;
      const bg = ctx.createLinearGradient(0,0,L,0);
      bg.addColorStop(0,   `hsl(${hue},100%,50%)`);
      bg.addColorStop(0.33,`hsl(${(hue+120)%360},100%,55%)`);
      bg.addColorStop(0.66,`hsl(${(hue+240)%360},100%,55%)`);
      bg.addColorStop(1,   `hsl(${hue},100%,50%)`);
      ctx.fillStyle = bg; poly(L*0.20,L*0.92,3.8,0.88); ctx.fill();
      ctx.shadowBlur = 0;
      // 稜鏡亮面
      ctx.fillStyle = 'rgba(255,255,255,0.36)'; poly(L*0.22,L*0.90,1.1,0.28); ctx.fill();
      // 神聖紋路
      ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 0.7;
      for (let i=0.28; i<0.88; i+=0.10) {
        const r = 3.4*(1-i*0.88), x = L*i;
        ctx.beginPath(); ctx.moveTo(x,-r); ctx.lineTo(x+L*0.03,0); ctx.lineTo(x,r); ctx.stroke();
      }
      // 黃金握把
      const gg = ctx.createLinearGradient(0,-5.0,0,5.0);
      gg.addColorStop(0,'#b8860b'); gg.addColorStop(0.5,'#ffd700'); gg.addColorStop(1,'#886200');
      ctx.fillStyle = gg; poly(0,L*0.20,5.0,3.8); ctx.fill();
      ctx.fillStyle = 'rgba(255,248,180,0.38)'; poly(0,L*0.18,1.4,1.05); ctx.fill();
      ctx.strokeStyle = 'rgba(160,110,0,0.38)'; ctx.lineWidth = 1.0;
      for (let x=5; x<L*0.18; x+=5) { ctx.beginPath(); ctx.moveTo(x,-5); ctx.lineTo(x,5); ctx.stroke(); }
      // 神聖捲線座
      ctx.fillStyle = '#6a4800'; poly(L*0.19,L*0.28,5.5,3.8); ctx.fill();
      ctx.shadowColor = `hsl(${hue},100%,70%)`; ctx.shadowBlur = 4;
      ctx.strokeStyle = `hsl(${hue},100%,65%)`; ctx.lineWidth = 1.2;
      [L*0.21,L*0.26].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-5.5); ctx.lineTo(x,5.5); ctx.stroke(); });
      ctx.shadowBlur = 0;
      // 稜鏡導環（每個不同色相）
      [[0.35,4.2,2.3],[0.47,3.6,2.0],[0.58,3.0,1.7],[0.69,2.5,1.4],[0.79,2.0,1.1],[0.89,1.4,0.78]].forEach(([p,h,r],i) => {
        const x = L*p, rh = (hue+i*55)%360;
        ctx.shadowColor = `hsl(${rh},100%,70%)`; ctx.shadowBlur = 4;
        ctx.strokeStyle = `hsl(${rh},100%,68%)`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x,-h+r,r,Math.PI,0); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `hsl(${rh},80%,42%)`; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x-r,-h+r); ctx.lineTo(x-r*0.6,-0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+r,-h+r); ctx.lineTo(x+r*0.6,-0.3); ctx.stroke();
      });
      ctx.shadowBlur = 0;
      // 星芒竿尖
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 10;
      sprites._star(ctx, L, 0, 4.5);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.05; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L*0.92,0); ctx.lineTo(L-4,0); ctx.stroke();
      ctx.lineCap = 'butt';
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

  // ── Animated fish ──────────────────────────────────────────────────────
  // anim : 'idle'|'speedup'|'turn'|'rise'|'sink'|'startle'|'bite'|'jump'
  // t    : Date.now()
  // startleAmt : 0..1  (衝擊強度，用於 startle 的震幅衰退)
  fishAnimated(ctx, id, cx, cy, sz, color, facing, anim, t, startleAmt = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    const drawFn = sprites._fish[id] || sprites._fish._default;

    // ── 受驚水平震動（在 scale 之前 translate，保持畫面方向正確）
    if (anim === 'startle' && startleAmt > 0)
      ctx.translate(Math.sin(t * 0.32) * startleAmt * sz * 0.5, 0);

    ctx.scale(facing, 1);

    // ── 身體旋轉角度
    let bodyRot = 0;
    switch (anim) {
      case 'idle':    bodyRot = Math.sin(t * 0.0048) * 0.10; break;
      case 'speedup': bodyRot = Math.sin(t * 0.011)  * 0.17; break;
      case 'turn':    bodyRot = Math.sin(t * 0.0085) * 0.38; break;
      case 'rise':    bodyRot = -0.27 + Math.sin(t * 0.006) * 0.05; break;
      case 'sink':    bodyRot =  0.27 + Math.sin(t * 0.006) * 0.05; break;
      case 'startle': bodyRot = Math.sin(t * 0.016) * 0.22 * Math.max(startleAmt, 0.28); break;
      case 'bite':    bodyRot = Math.sin(t * 0.0055) * 0.09; break;
      case 'jump':    bodyRot = -0.36; break;
      default:        bodyRot = Math.sin(t * 0.005) * 0.09;
    }
    ctx.rotate(bodyRot);
    drawFn(ctx, sz, color);

    // ── 進食：嘴巴開合覆蓋層（在魚頭前端繪製暗弧）
    if (anim === 'bite') {
      const open = (Math.sin(t * 0.022) + 1) / 2;
      if (open > 0.1) {
        ctx.fillStyle = 'rgba(6,6,16,0.86)';
        ctx.beginPath();
        ctx.moveTo(sz * 1.48, 0);
        ctx.arc(sz * 1.48, 0, sz * 0.46 * open, -0.18, Math.PI * 0.74);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore(); // 回到 (cx, cy)，無 scale / rotate

    // ── 世界空間特效（不隨魚身旋轉）
    ctx.save();
    ctx.translate(cx, cy);

    if (anim === 'speedup') {
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const lx   = facing * (-sz * (2.2 + i * 0.85));
        const ly   = (i - 1) * sz * 0.45;
        const llen = facing * sz * (1.0 - i * 0.22);
        ctx.strokeStyle = `rgba(180,215,255,${(0.58 - i * 0.16).toFixed(2)})`;
        ctx.lineWidth = 1.9 - i * 0.45;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - llen, ly); ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }

    if (anim === 'rise')
      sprites._drawBubbles(ctx, t, sz, facing);

    if (anim === 'bite') {
      // 懸垂的釣線＋魚鉤
      const hookX = sz * 0.8 * facing;
      ctx.strokeStyle = 'rgba(220,220,220,0.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hookX, -sz * 3.2); ctx.lineTo(hookX, -sz * 1.6); ctx.stroke();
      ctx.strokeStyle = '#bbbbbb'; ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(hookX + sz * 0.18 * facing, -sz * 1.6, sz * 0.18, Math.PI * 0.5, Math.PI * 1.5, facing > 0);
      ctx.stroke();
      ctx.strokeStyle = '#cc5533'; ctx.lineWidth = sz * 0.11; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hookX, -sz * 1.6);
      ctx.bezierCurveTo(hookX + sz * 0.14 * facing, -sz * 1.2, hookX - sz * 0.1 * facing, -sz * 0.85, hookX + sz * 0.1 * facing, -sz * 0.65);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    if (anim === 'startle' && startleAmt > 0.08) {
      const alpha = Math.min(1, startleAmt * 1.25);
      ctx.fillStyle = `rgba(255,255,50,${alpha.toFixed(2)})`;
      ctx.font = `bold ${Math.round(sz * 1.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -sz * 2.65);
    }

    if (anim === 'jump')
      sprites._drawSplash(ctx, t, sz);

    ctx.restore();
  },

  _drawBubbles(ctx, t, sz, facing = 1) {
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const phase = ((t * 0.0011 + i * 0.38) % 1);
      const bx = facing * sz * (0.9 + i * 0.4);
      const by = -(phase * sz * 2.4) - sz * 0.1;
      const br = sz * (0.11 + i * 0.055);
      ctx.strokeStyle = `rgba(160,225,255,${(0.72 - i * 0.14).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.stroke();
    }
  },

  _drawSplash(ctx, t, sz) {
    const age  = (t * 0.0035) % Math.PI;
    const baseY = sz * 1.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = (i / 4) * Math.PI * 1.4 - Math.PI * 0.7;
      const r = sz * (0.85 + Math.sin(age) * 0.52);
      ctx.lineWidth = Math.max(0.4, 1.6 - i * 0.22);
      ctx.strokeStyle = 'rgba(100,185,255,0.72)';
      ctx.globalAlpha = 0.68;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * sz * 0.2, baseY);
      ctx.lineTo(Math.cos(a) * r * 0.55, baseY - Math.abs(Math.sin(a)) * r);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineCap = 'butt';
  },
};
