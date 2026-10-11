// Motion do kit Raio-X (11/10/2026). Carregar DEPOIS de raiox-kit.js.
// Tudo é função do tempo: cada quadro sai de renderMotion(t), sem estado entre quadros, e o render grava quadro a quadro.
// Peças: tempo da fala (cue), tipografia cinética, morph entre formas, wireframe 3D no traço de planta e câmera virtual.
// Continua valendo a regra do kit: traço, sem brilho, ciano só em destaque.

// ---------- tempo da fala ----------
// TEMPOS vem de voz.py (arquivo .tempos.js): cenas, frases e palavras com t0/t1 em segundos.
let SCENE_I = 0; // cena sendo desenhada (renderMotion define)
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
// tempo LOCAL (dentro da cena atual) em que a n-ésima ocorrência da palavra começa a ser falada
function cue(word, n = 1, cena = SCENE_I) {
  let k = 0;
  for (const p of TEMPOS.palavras) if (p.cena === cena && norm(p.w) === norm(word) && ++k === n) return p.t0 - TEMPOS.cenas[cena];
  throw new Error(`cue: "${word}" (${n}) não está na cena ${cena}`);
}
// fim da fala da palavra (tempo local)
function cueEnd(word, n = 1, cena = SCENE_I) {
  let k = 0;
  for (const p of TEMPOS.palavras) if (p.cena === cena && norm(p.w) === norm(word) && ++k === n) return p.t1 - TEMPOS.cenas[cena];
  throw new Error(`cueEnd: "${word}"`);
}
// fração da frase já falada (para texto digitado no ritmo da voz)
function spoken(t, frase) { const f = TEMPOS.frases[frase]; return prog(t, f[0], f[1]); }

// ---------- curvas ----------
const easeOutBack = x => back(clamp(x));
const easeOutElastic = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1;
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
// interpola quadros-chave [[t, v1, v2...], ...] com easeInOut entre eles
function keys(list, t) {
  if (t <= list[0][0]) return list[0].slice(1);
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i], b = list[i + 1];
    if (t < b[0]) { const e = easeInOut(prog(t, a[0], b[0])); return a.slice(1).map((v, k) => lerp(v, b[k + 1], e)); }
  }
  return list[list.length - 1].slice(1);
}

// ---------- câmera virtual ----------
// cada cena pode declarar CAMS[i] = [[t, x, y, zoom, rotGraus], ...] em tempo local. x/y movem o olhar (px).
const CAMS = [];
function camAt(i, lt) {
  const k = (typeof CAMS[i] === 'function' ? CAMS[i]() : CAMS[i]) || [[0, 0, 0, 1, 0]]; // função: pode usar cue()
  const [x, y, z, r] = keys(k, lt);
  return { x: clamp(x, -30, 30), y: clamp(y, -30, 30), z: Math.min(1.04, z * (1 + .004 * lt)), r: 0 }; // limites: título e bordas nunca saem do quadro // + empurrão lento e contínuo. Sem giro: o Diego achou as formas tortas (11/10)
}
function applyCam(cam) {
  ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.rotate(cam.r); ctx.translate(-W / 2 - cam.x, -H / 2 - cam.y);
}
// papel de planta com paralaxe: a grade anda na metade da câmera; moldura e rodapé ficam fixos (HUD)
function bgPaper(cam) {
  ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H);
  ctx.save();
  const z = 1 + (cam.z - 1) * .5;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(cam.r * .5); ctx.translate(-W / 2 - cam.x * .5, -H / 2 - cam.y * .5);
  ctx.lineWidth = 1.5;
  const x0 = Math.floor((cam.x * .5 - W) / 150) * 150, y0 = Math.floor((cam.y * .5 - H) / 150) * 150;
  for (let x = x0; x <= x0 + 3 * W; x += 30) { ctx.strokeStyle = x % 150 ? COL.minor : COL.major; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 3 * H); ctx.stroke(); }
  for (let y = y0; y <= y0 + 3 * H; y += 30) { ctx.strokeStyle = y % 150 ? COL.minor : COL.major; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + 3 * W, y); ctx.stroke(); }
  ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * .75);
  vg.addColorStop(0, 'rgba(6,20,51,0)'); vg.addColorStop(1, 'rgba(2,6,15,.75)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}
function hud(t) {
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(40, 40, W - 80, H - 80);
  txt(`IA SEM MISTÉRIO · PRANCHA ${typeof EP !== 'undefined' ? EP : '00'}`, 70, H - 75, ARC, 22, COL.dim, { weight: 600, ls: 3 });
  txt(`ESC 1:1 · ${t.toFixed(1)}s`, W - 70, H - 75, ARC, 22, COL.dim, { align: 'right', weight: 600, ls: 3 });
}

// ---------- tipografia cinética ----------
// palavras que "caem" no lugar quando são faladas. words: [{w, t}] (t = tempo local em que a palavra pousa)
// o: {size, font, color, hl: [índices em ciano], maxW, lh, align}
function kinetic(words, x, y, lt, o = {}) {
  const size = o.size ?? 96, f = o.font ?? EXP, maxW = o.maxW ?? W - 2 * M, lh = o.lh ?? size * 1.12, gap = size * .32;
  const lay = []; let cx = 0, cy = 0;
  words.forEach((wd, i) => {
    const s = (o.upper === false ? wd.w : wd.w.toUpperCase()); const ww = measure(s, f, size);
    if (cx + ww > maxW && cx > 0) { cx = 0; cy += lh; }
    lay.push({ s, ww, x: cx, y: cy, t: wd.t, i }); cx += ww + gap;
  });
  lay.forEach(l => {
    const p = prog(lt, l.t - .08, l.t + .32); if (p <= 0) return;
    const e = easeOutBack(p), sc = lerp(1.25, 1, e), dy = (1 - smooth(p)) * size * .55, rot = 0; // palavras entram retas (Diego, 11/10)
    const hot = prog(lt, l.t, l.t + .05) * (1 - prog(lt, l.t + .45, l.t + .8)); // palavra falada agora: ciano por um instante
    const hl = (o.hl || []).includes(l.i);
    ctx.save();
    ctx.translate(x + l.x + l.ww / 2, y + l.y + dy); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.globalAlpha *= clamp(p * 2.5);
    txt(l.s, 0, 0, f, size, hl || hot > .5 ? COL.cyan : (o.color ?? COL.ink), { align: 'center' });
    ctx.restore();
  });
}
// atalho: frase falada vira palavras cinéticas sincronizadas (palavras da legenda da frase n, filtradas)
function kineticFrom(frase, pick, x, y, lt, o = {}) {
  const base = TEMPOS.cenas[SCENE_I];
  const ws = TEMPOS.palavras.filter(p => p.t0 >= TEMPOS.frases[frase][0] - .01 && p.t1 <= TEMPOS.frases[frase][1] + .01);
  const chosen = pick ? ws.filter(p => pick.includes(norm(p.w))) : ws;
  kinetic(chosen.map(p => ({ w: p.w.replace(/[,.:]$/, ''), t: p.t0 - base })), x, y, lt, o);
}
// letras que entram uma a uma, girando e fechando o espaçamento (para a palavra-chave da cena)
function kineticLetters(str, x, y, lt, t0, o = {}) {
  const size = o.size ?? 150, f = o.font ?? EXP, s = str.toUpperCase();
  const ls = lerp(size * .35, 0, easeOut(prog(lt, t0, t0 + .7)));
  let total = 0; const ws = [...s].map(ch => { const w = measure(ch, f, size); total += w; return w; }); total += ls * (s.length - 1);
  let cx = (o.align === 'left') ? x : x - total / 2;
  [...s].forEach((ch, i) => {
    const p = prog(lt, t0 + i * .045, t0 + i * .045 + .4);
    if (p > 0) {
      ctx.save(); ctx.translate(cx + ws[i] / 2, y - (1 - easeOut(p)) * size * .8); 
      ctx.globalAlpha *= clamp(p * 2);
      txt(ch, 0, 0, f, size, o.color ?? COL.ink, { align: 'center' }); ctx.restore();
    }
    cx += ws[i] + ls;
  });
}
// contador tipo odômetro: dígitos rolam na vertical
function odometer(value, digits, x, y, size, color = COL.cyan) {
  const v = Math.max(0, value); const dw = measure('0', EXP, size) * 1.02;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - size * .62, dw * digits + 8, size * 1.24); ctx.clip();
  for (let d = 0; d < digits; d++) {
    const place = Math.pow(10, digits - 1 - d); const raw = v / place;
    const cur = Math.floor(raw) % 10, frac = d === digits - 1 ? raw - Math.floor(raw) : smooth(clamp((raw % 1 - .85) / .15));
    for (let k = -1; k <= 1; k++) {
      const n = ((cur + k) % 10 + 10) % 10;
      txt(String(n), x + d * dw + dw / 2, y + (k - frac) * size * 1.1, EXP, size, color, { align: 'center' });
    }
  }
  ctx.restore();
}

// ---------- morph entre formas ----------
// toda forma vira N pontos, começando no topo e seguindo no sentido horário; o morph interpola ponto a ponto
const NPTS = 120;
function samplePoly(verts, n = NPTS) {
  const segs = verts.map((v, i) => { const w = verts[(i + 1) % verts.length]; return { a: v, b: w, L: Math.hypot(w[0] - v[0], w[1] - v[1]) }; });
  const total = segs.reduce((s, g) => s + g.L, 0); const out = [];
  for (let k = 0; k < n; k++) {
    let d = total * k / n;
    for (const g of segs) { if (d <= g.L) { out.push([lerp(g.a[0], g.b[0], d / g.L), lerp(g.a[1], g.b[1], d / g.L)]); break; } d -= g.L; }
  }
  return out;
}
function regular(k, cx, cy, r, rot = 0) { return Array.from({ length: k }, (_, i) => { const a = -Math.PI / 2 + rot + i * 2 * Math.PI / k; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); }
function shape(type, cx, cy, r, o = {}) {
  switch (type) {
    case 'circle': return Array.from({ length: NPTS }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / NPTS; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
    case 'square': return samplePoly([[cx, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r], [cx - r, cy - r]]);
    case 'rect': { const w = o.w / 2, h = o.h / 2; return samplePoly([[cx, cy - h], [cx + w, cy - h], [cx + w, cy + h], [cx - w, cy + h], [cx - w, cy - h]]); }
    case 'triangle': return samplePoly(regular(3, cx, cy, r));
    case 'play': return samplePoly([[cx - r * .55, cy - r * .8], [cx + r * .85, cy], [cx - r * .55, cy + r * .8]]);
    case 'diamond': return samplePoly(regular(4, cx, cy, r));
    case 'hexagon': return samplePoly(regular(6, cx, cy, r));
    case 'star': return samplePoly(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; }));
  }
}
function morph(a, b, p) { const e = easeInOut(clamp(p)); return a.map((v, i) => [lerp(v[0], b[i][0], e), lerp(v[1], b[i][1], e)]); }
function pathPts(pts) { ctx.beginPath(); pts.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); }
function strokeShape(pts, o = {}) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = o.color ?? COL.ink; ctx.lineWidth = o.lw ?? 5;
  if (o.fill) { ctx.fillStyle = o.fill; pathPts(pts); ctx.fill(); }
  if ((o.p ?? 1) < 1) { let L = 0; pts.forEach((v, i) => { const w = pts[(i + 1) % pts.length]; L += Math.hypot(w[0] - v[0], w[1] - v[1]); }); draw(o.p, L, () => { pathPts(pts); ctx.stroke(); }); }
  else { pathPts(pts); ctx.stroke(); }
  ctx.restore();
}
// sequência de formas no tempo: steps = [[t, pts], ...]; devolve os pontos do instante
function morphSeq(steps, lt, dur = .45) {
  let cur = steps[0][1];
  for (let i = 1; i < steps.length; i++) { const p = prog(lt, steps[i][0], steps[i][0] + dur); if (p > 0) cur = morph(cur, steps[i][1], p); }
  return cur;
}

// ---------- wireframe 3D ----------
// malha = {v: [[x,y,z]], e: [[i,j]]}; o = {x, y, s (escala px), rx, ry, rz (rad), d (distância da lente)}
function rot3([x, y, z], rx, ry, rz) {
  let c = Math.cos(rx), s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry); s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rz); s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}
function proj3(v, o) { const [x, y, z] = rot3(v, o.rx || 0, o.ry || 0, o.rz || 0); const d = o.d ?? 4, k = d / (d + z); return [o.x + x * o.s * k, o.y + y * o.s * k, z]; }
// p: quanto da malha já foi traçado (arestas em ordem); arestas do fundo ficam mais apagadas
function wire(mesh, o, p = 1, color = COL.ink, lw = 3) {
  if (p <= 0) return;
  o = { ...o, rx: -.42, ry: .62, rz: 0 }; // vista isométrica fixa: o objeto não gira nem fica torto (Diego, 11/10)
  const P = mesh.v.map(v => proj3(v, o)); const n = mesh.e.length; const upto = n * clamp(p);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = lw;
  mesh.e.forEach(([i, j], k) => {
    if (k >= upto) return; const f = clamp(upto - k);
    const a = P[i], b = P[j]; const depth = (a[2] + b[2]) / 2;
    ctx.globalAlpha = lerp(1, .35, clamp((depth + 1) / 2));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); ctx.stroke();
  });
  ctx.restore();
  return P;
}
const Mesh = {
  box(w = 1, h = 1, d = 1) {
    const v = []; for (const x of [-w, w]) for (const y of [-h, h]) for (const z of [-d, d]) v.push([x / 2, y / 2, z / 2]);
    return { v, e: [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]] };
  },
  cylinder(r = .5, h = .2, seg = 28, y0 = 0) {
    const v = [], e = [];
    for (let k = 0; k < 2; k++) for (let i = 0; i < seg; i++) { const a = i * 2 * Math.PI / seg; v.push([Math.cos(a) * r, y0 + (k ? h / 2 : -h / 2), Math.sin(a) * r]); }
    for (let i = 0; i < seg; i++) { e.push([i, (i + 1) % seg], [seg + i, seg + (i + 1) % seg]); if (i % 4 === 0) e.push([i, seg + i]); }
    return { v, e };
  },
  sphere(r = .5, lat = 8, lon = 14) {
    const v = [], e = [];
    for (let i = 1; i < lat; i++) for (let j = 0; j < lon; j++) { const th = Math.PI * i / lat, ph = 2 * Math.PI * j / lon; v.push([r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)]); }
    for (let i = 0; i < lat - 1; i++) for (let j = 0; j < lon; j++) { const a = i * lon + j; e.push([a, i * lon + (j + 1) % lon]); if (i < lat - 2) e.push([a, a + lon]); }
    return { v, e };
  },
  torus(R = 1, r = .25, seg = 32, sides = 8) {
    const v = [], e = [];
    for (let i = 0; i < seg; i++) for (let j = 0; j < sides; j++) { const u = 2 * Math.PI * i / seg, w = 2 * Math.PI * j / sides; v.push([(R + r * Math.cos(w)) * Math.cos(u), r * Math.sin(w), (R + r * Math.cos(w)) * Math.sin(u)]); }
    for (let i = 0; i < seg; i++) for (let j = 0; j < sides; j++) { const a = i * sides + j; e.push([a, i * sides + (j + 1) % sides]); if (j % 2 === 0) e.push([a, ((i + 1) % seg) * sides + j]); }
    return { v, e };
  },
  // pirâmide de visão de uma câmera (frustum) + corpo
  camera() {
    const b = Mesh.box(.6, .4, .5), v = b.v.slice(), e = b.e.slice(); const o = v.length;
    v.push([-.18, -.12, .25], [.18, -.12, .25], [.18, .12, .25], [-.18, .12, .25], [-.45, -.32, .85], [.45, -.32, .85], [.45, .32, .85], [-.45, .32, .85]);
    for (let i = 0; i < 4; i++) e.push([o + i, o + (i + 1) % 4], [o + 4 + i, o + 4 + (i + 1) % 4], [o + i, o + 4 + i]);
    return { v, e };
  },
  // extrusão de um contorno 2D (pts em unidades) com profundidade d
  extrude(pts, d = .2) {
    const n = pts.length, v = [], e = [];
    pts.forEach(([x, y]) => v.push([x, y, -d / 2])); pts.forEach(([x, y]) => v.push([x, y, d / 2]));
    for (let i = 0; i < n; i++) e.push([i, (i + 1) % n], [n + i, n + (i + 1) % n], [i, n + i]);
    return { v, e };
  },
};

// ---------- legenda sincronizada com a fala ----------
// substitui a do kit: a palavra acende quando é falada (tempo real de voz.py), cresce um pouco e volta;
// a frase fica na tela até a próxima começar (sem piscar nas pausas)
function captions(t) {
  const F = TEMPOS.frases; let fi = -1;
  for (let k = 0; k < F.length; k++) if (t >= F[k][0] - .05 && (k === F.length - 1 ? t < F[k][1] + .5 : t < F[k + 1][0] - .05)) { fi = k; break; }
  if (fi < 0) return;
  const [a, b, str] = F[fi]; const size = 50;
  const ws = TEMPOS.palavras.filter(p => p.t0 >= a - .01 && p.t1 <= b + .01);
  const lines = []; let cur = []; let lw = 0;
  ws.forEach((w, i) => { const ww = measure(w.w + ' ', ARC, size, 600); if (lw + ww > 840 && cur.length) { lines.push(cur); cur = []; lw = 0; } cur.push({ ...w, ww, i }); lw += ww; });
  lines.push(cur);
  const y0 = 1470, bh = lines.length * 72 + 40, by = y0 - 56;
  const pin = easeOutBack(prog(t, a - .05, a + .2));
  ctx.save(); ctx.translate(W / 2, by + bh / 2); ctx.scale(lerp(.92, 1, pin), lerp(.92, 1, pin)); ctx.translate(-W / 2, -(by + bh / 2));
  ctx.fillStyle = COL.black; ctx.fillRect(80, by, 920, bh);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 5; const k = 30;
  [[80, by, 1, 1], [1000, by, -1, 1], [80, by + bh, 1, -1], [1000, by + bh, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x + sx * k, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * k); ctx.stroke();
  });
  lines.forEach((ln, li) => {
    const lwid = ln.reduce((s, w) => s + w.ww, 0); let x = W / 2 - lwid / 2; const y = y0 + li * 72;
    ln.forEach(w => {
      const on = t >= w.t0 && t < w.t1, said = t >= w.t0;
      const pop = 1 + .12 * Math.sin(Math.PI * prog(t, w.t0, w.t0 + .22));
      const ww = measure(w.w, ARC, size, 600);
      ctx.save(); ctx.translate(x + ww / 2, y); ctx.scale(pop, pop);
      txt(w.w, 0, 0, ARC, size, on ? COL.cyan : COL.ink, { weight: 600, align: 'center', alpha: said ? 1 : .55 }); ctx.restore();
      x += w.ww;
    });
  });
  ctx.restore();
}

// ---------- montagem com câmera e transição por scan ----------
// troca de cena: uma linha de scan desce e revela a cena nova. TRANS = duração (s).
const TRANS = .5;
function drawScene(i, t) {
  const lt = t - SC[i]; SCENE_I = i; const cam = camAt(i, lt);
  bgPaper(cam); ctx.save(); applyCam(cam); SCENES[i](t, lt); ctx.restore();
}
function renderMotion(t) {
  ctx.save(); ctx.clearRect(0, 0, W, H);
  let i = SCENES.length - 1; for (let k = 0; k < SCENES.length; k++) if (t < SC[k + 1]) { i = k; break; }
  const lt = t - SC[i];
  if (i > 0 && lt < TRANS) {
    // transição: linha de scan desce e revela a cena nova por baixo da anterior (sem giro nem forma deformada, pedido do Diego 11/10)
    const e = easeInOut(lt / TRANS), y = H * e;
    SCENE_I = i; const c1 = camAt(i, lt);
    bgPaper(c1); ctx.save(); applyCam(c1); SCENES[i](t, lt); ctx.restore();
    const prev = i - 1; SCENE_I = prev; const c0 = camAt(prev, t - SC[prev]);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, H - y); ctx.clip();
    bgPaper(c0); ctx.save(); applyCam(c0); SCENES[prev](t, t - SC[prev]); ctx.restore(); ctx.restore();
    SCENE_I = i;
    ctx.fillStyle = 'rgba(46,230,255,.18)'; ctx.fillRect(0, y - 70, W, 70);
    ctx.fillStyle = COL.cyan; ctx.fillRect(0, y - 3, W, 6);
  } else drawScene(i, t);
  hud(t);
  captions(t);
  ctx.restore();
}
window.render = renderMotion;
