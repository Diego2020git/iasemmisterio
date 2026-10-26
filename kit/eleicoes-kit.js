// Peças dos extras de eleição (26/10/2026). Carregar depois de neon-extra.js. Vêm do extra PHP2Shell (legenda, títulos, fundo com chão) e do extra do 2º turno.
const VERM = '#ff4d6d', VERDE = '#3ddc84', AMB = '#ffc24b';
const flut = (t, k = 0) => 10 * Math.sin(t * 1.6 + k); // flutuação leve

// ---------- legenda grande, palavra por palavra (blocos de até 3 palavras) ----------
const BLOCOS = []; { let cur = []; for (const p of PAL) { if (cur.length && (cur[0].cena !== p.cena || cur.length === 3 || /[.,:?!]$/.test(cur[cur.length - 1].w))) { BLOCOS.push(cur); cur = []; } cur.push(p); } if (cur.length) BLOCOS.push(cur); }
function legenda(t) {
  if (t > PAL[PAL.length - 1].t1 + .3) return;
  const b = BLOCOS.find((b, i) => t >= b[0].t0 - .05 && (i === BLOCOS.length - 1 || t < BLOCOS[i + 1][0].t0 - .05)); if (!b || t > b[b.length - 1].t1 + .6) return;
  const words = b.map(p => p.w.replace(/[.,:?!]+$/, '').toUpperCase()), size = 66, gap = 22;
  const ws = words.map(w => measure(w, EXP, size)), tot = ws.reduce((a, c) => a + c, 0) + gap * (words.length - 1);
  const sc = Math.min(1, 940 / tot), y = 1480, e = back(prog(t, b[0].t0 - .05, b[0].t0 + .15));
  ctx.save(); ctx.translate(cx0, y); ctx.scale(sc * (.9 + .1 * e), sc * (.9 + .1 * e));
  ctx.fillStyle = 'rgba(3,6,14,.72)'; rr(-tot / 2 - 34, -62, tot + 68, 124, 30); ctx.fill();
  let x = -tot / 2;
  b.forEach((p, i) => { const on = t >= p.t0 - .03, atual = on && (i === b.length - 1 || t < b[i + 1].t0 - .03);
    ctx.save(); if (atual) { ctx.shadowColor = CI; ctx.shadowBlur = 30; }
    txt(words[i], x, 4, EXP, size, atual ? CI : on ? BR : 'rgba(244,248,255,.38)'); ctx.restore(); x += ws[i] + gap; });
  ctx.restore();
}
// ---------- peças ----------
Object.assign(P, {
  escudo() { ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(85, -65); ctx.quadraticCurveTo(85, 50, 0, 100); ctx.quadraticCurveTo(-85, 50, -85, -65); ctx.closePath(); },
  servidor() { ctx.beginPath(); for (let k = 0; k < 3; k++) { const y = -96 + k * 66; rr(-90, y, 180, 56, 12); ctx.moveTo(-50, y + 28); ctx.arc(-60, y + 28, 10, 0, 7); ctx.moveTo(10, y + 22); ctx.lineTo(70, y + 22); ctx.lineTo(70, y + 34); ctx.lineTo(10, y + 34); ctx.closePath(); } },
});
// janela escura de código: linhas entram uma a uma; marca = índice da linha com a falha; scan = 0..1 feixe da IA descendo
function codigo(x, y, w, linhas, p, a, titulo, o = {}) {
  if (a <= 0) return; const lh = 74, h = 110 + linhas.length * lh, e = .88 + .12 * back(clamp(a)), cor = o.cor || CI;
  ctx.save(); ctx.globalAlpha *= clamp(a * 1.5); ctx.translate(x + w / 2, y + h / 2); ctx.scale(e, e); ctx.translate(-x - w / 2, -y - h / 2);
  ctx.shadowColor = hex(cor, .7); ctx.shadowBlur = 60; ctx.fillStyle = '#060a15'; rr(x, y, w, h, 28); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = hex(cor, .9); ctx.lineWidth = 4; rr(x, y, w, h, 28); ctx.stroke();
  ['#ff6b6b', '#ffc24b', '#3ddc84'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 40 + i * 30, y + 40, 9, 0, 7); ctx.fill(); });
  txt(titulo, x + w / 2, y + 40, ARC, 28, 'rgba(244,248,255,.6)', { align: 'center', weight: 600 });
  const n = linhas.length * clamp(p);
  linhas.forEach(([s, c], i) => { const k = clamp(n - i); if (k <= 0) return; const m = Math.floor(s.length * k), yy = y + 112 + i * lh;
    if (o.marca === i && o.alerta > 0) { ctx.save(); ctx.globalAlpha *= clamp(o.alerta); ctx.fillStyle = hex(VERM, .22 + .1 * Math.sin(o.t * 8)); rr(x + 16, yy - 32, w - 32, 64, 12); ctx.fill(); ctx.restore(); }
    txt(s.slice(0, m) + (k < 1 ? '▌' : ''), x + 40, yy, ARC, 42, c || BR, { weight: 600 }); });
  if (o.scan > 0 && o.scan < 1) { const sy = y + 70 + (h - 80) * o.scan; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, sy - 60, 0, sy + 6); g.addColorStop(0, hex(CI, 0)); g.addColorStop(1, hex(CI, .55)); ctx.fillStyle = g; ctx.fillRect(x + 6, sy - 60, w - 12, 66);
    ctx.fillStyle = CI; ctx.fillRect(x + 6, sy, w - 12, 4); ctx.restore(); }
  ctx.restore();
}
function versao(str, x, y, a, cor, risco = 0, size = 52) {
  if (a <= 0) return; const e = back(clamp(a)), w = measure(str, EXP, size) + 70;
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha *= clamp(a * 2);
  ctx.shadowColor = cor; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(8,16,34,.92)'; rr(-w / 2, -size, w, size * 2, size); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = cor; ctx.lineWidth = 4; rr(-w / 2, -size, w, size * 2, size); ctx.stroke();
  txt(str, 0, 3, EXP, size, BR, { align: 'center' });
  if (risco > 0) { ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 18, 0); ctx.lineTo(-w / 2 + 18 + (w - 36) * ease(risco), 0); ctx.stroke(); }
  ctx.restore();
}
function seta(x0, x1, y, a, cor = CI) {
  if (a <= 0) return; const x = lerp(x0, x1, ease(clamp(a)));
  ctx.save(); ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 24; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x - 10, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x - 26, y - 24); ctx.lineTo(x - 26, y + 24); ctx.closePath(); ctx.fill(); ctx.restore();
}
// título grande em caixa alta (Archivo Expanded), entra crescendo
function titulo(str, y, t0, t1, t, size = 96, cor = BR, hot = '', hotCor = CI) {
  const a = prog(t, t0, t0 + .25) * (1 - prog(t, t1, t1 + .3)); if (a <= 0) return; const e = back(prog(t, t0, t0 + .4));
  const w = measure(str, EXP, size), sc = Math.min(1, 840 / w);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx0, y); ctx.scale(sc * (.85 + .15 * e), sc * (.85 + .15 * e));
  ctx.shadowColor = hex(hotCor, .7); ctx.shadowBlur = 40; txt(str, 0, 0, EXP, size, cor, { align: 'center' });
  if (hot) { const hx = -w / 2 + measure(str.slice(0, str.indexOf(hot)), EXP, size); txt(hot, hx, 0, EXP, size, hotCor); }
  ctx.restore();
}
// ---------- fundo v3: chão de grade em perspectiva + partículas subindo ----------
const fundoBase = fundo;
fundo = function (t, i, p) {
  fundoBase(t, i, p);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const hz = 1240, cor = COR[i];
  for (let k = 0; k < 14; k++) { const z = ((k + (t * .6) % 1) / 14), y = hz + Math.pow(z, 2.2) * (H - hz);
    ctx.strokeStyle = hex(cor, .05 + .22 * z); ctx.lineWidth = 1 + 2 * z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let k = -12; k <= 12; k++) { ctx.strokeStyle = hex(cor, .12); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx0 + k * 30, hz); ctx.lineTo(cx0 + k * 260, H); ctx.stroke(); }
  for (let k = 0; k < 40; k++) { const s = (k * 9301 + 49297) % 233280 / 233280, s2 = (k * 7919) % 1000 / 1000;
    const y = H - ((t * (30 + 50 * s) + s2 * H) % H), x = s * W + 30 * Math.sin(t * .7 + k);
    ctx.fillStyle = hex(k % 3 ? CI : AZ, .25 + .3 * s2); ctx.beginPath(); ctx.arc(x, y, 1.5 + 2.5 * s, 0, 7); ctx.fill(); }
  ctx.restore();
};
// ---------- peças v3 ----------
function painel(top, a, conteudo) { janela(top, 560, a, 'seusite.com.br · painel da hospedagem', conteudo, 940); }
// bloco de memória: estado 'vazio' | 'cheio' | 'metade' | 'livre' | 'ataque'
function bloco(x, y, w, h, est, a, t, k = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a * 2); const e = .85 + .15 * back(clamp(a)); ctx.translate(x + w / 2, y + h / 2); ctx.scale(e, e); ctx.translate(-x - w / 2, -y - h / 2);
  const C = { vazio: 'rgba(244,248,255,.25)', cheio: AZ, metade: AMB, livre: 'rgba(244,248,255,.55)', ataque: VERM }[est];
  if (est === 'livre') ctx.setLineDash([12, 10]);
  ctx.fillStyle = est === 'cheio' ? hex(AZ, .55) : est === 'ataque' ? hex(VERM, .45 + .15 * Math.sin(t * 8)) : 'rgba(8,14,30,.85)';
  rr(x, y, w, h, 14); ctx.fill();
  if (est === 'metade') { ctx.fillStyle = hex(AMB, .5); rr(x, y, w * .5 * k, h, 14); ctx.fill();
    ctx.save(); rr(x, y, w, h, 14); ctx.clip(); ctx.strokeStyle = hex(AMB, .35); ctx.lineWidth = 4; for (let d = -h; d < w; d += 22) { ctx.beginPath(); ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h, y); ctx.stroke(); } ctx.restore(); }
  ctx.strokeStyle = C; ctx.lineWidth = est === 'vazio' ? 2 : 4; if (est !== 'vazio') { ctx.shadowColor = C; ctx.shadowBlur = 18; } rr(x, y, w, h, 14); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
function grade(x0, y0, cols, rows, cw, ch, estado, a, t) { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, s = estado(i);
  bloco(x0 + c * (cw + 14), y0 + r * (ch + 14), cw, ch, s.e, a * clamp((s.a ?? 1)), t, s.k ?? 1); } }
function chipLegenda(items, y, a) { if (a <= 0) return; const ws = items.map(([s]) => measure(s, ARC, 30, 600) + 70), tot = ws.reduce((p, c) => p + c, 0) + 24 * (items.length - 1); let x = cx0 - tot / 2;
  items.forEach(([s, c], i) => { ctx.save(); ctx.globalAlpha *= clamp(a * 2 - i * .3); ctx.fillStyle = c; rr(x, y - 14, 28, 28, 7); ctx.fill(); txt(s, x + 40, y, ARC, 30, BR, { weight: 600 }); ctx.restore(); x += ws[i] + 24; }); }
function pilula(str, x, y, w, a, cor, sub = '', on = 1, size = 40) {
  if (a <= 0) return; const e = back(clamp(a)), h = sub ? 120 : 96;
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha *= clamp(a * 2);
  ctx.shadowColor = cor; ctx.shadowBlur = 30 * on; ctx.fillStyle = 'rgba(8,16,34,.92)'; rr(-w / 2, -h / 2, w, h, 24); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = on ? cor : 'rgba(244,248,255,.25)'; ctx.lineWidth = 4; rr(-w / 2, -h / 2, w, h, 24); ctx.stroke();
  txt(str, 0, sub ? -18 : 2, ARC, size, BR, { align: 'center', weight: 600 });
  if (sub) txt(sub, 0, 30, ARC, 26, cor, { align: 'center', weight: 600, ls: 1 });
  ctx.restore();
}
function linha(x0, y0, x1, y1, p, cor, t, pulso = true) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = hex(cor, .8); ctx.shadowColor = cor; ctx.shadowBlur = 16; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, ease(p)), lerp(y0, y1, ease(p))); ctx.stroke();
  if (pulso && p >= 1) { const q = (t * 1.2) % 1; ctx.fillStyle = BR; ctx.beginPath(); ctx.arc(lerp(x0, x1, q), lerp(y0, y1, q), 7, 0, 7); ctx.fill(); }
  ctx.restore();
}
// ---------- peças deste vídeo ----------
Object.assign(P, {
  urna() { ctx.beginPath(); rr(-100, -30, 200, 130, 18); ctx.moveTo(-60, -30); ctx.lineTo(-45, -80); ctx.lineTo(45, -80); ctx.lineTo(60, -30); ctx.moveTo(-45, 10); ctx.lineTo(45, 10); },
  moeda() { ctx.beginPath(); ctx.arc(0, 0, 96, 0, 7); ctx.moveTo(70, 0); ctx.arc(0, 0, 70, 0, Math.PI * 2, true); },
});
function barra(nome, val, max, y, a, cor) {
  if (a <= 0) return; const x = cx0 - 420, w = 840, k = ease(clamp(a)), v = val * k;
  ctx.save(); ctx.globalAlpha *= clamp(a * 2);
  txt(nome, x, y - 50, ARC, 46, BR, { weight: 600 }); txt(v.toFixed(1).replace('.', ',') + '%', x + w, y - 50, EXP, 56, cor, { align: 'right' });
  ctx.fillStyle = 'rgba(244,248,255,.1)'; rr(x, y, w, 64, 32); ctx.fill();
  ctx.shadowColor = cor; ctx.shadowBlur = 30; ctx.fillStyle = cor; rr(x, y, Math.max(64, w * v / max), 64, 32); ctx.fill(); ctx.restore();
}
function rosca(x, y, R, segs) {
  ctx.save(); ctx.strokeStyle = 'rgba(244,248,255,.08)'; ctx.lineWidth = 96; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke(); ctx.restore();
  let a0 = -Math.PI / 2;
  segs.forEach(([v, cor, p]) => { const a1 = a0 + 2 * Math.PI * v * ease(clamp(p)) - .02;
    if (p > 0) { ctx.save(); ctx.strokeStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 30; ctx.lineWidth = 96; ctx.beginPath(); ctx.arc(x, y, R, a0 + .02, Math.max(a0 + .03, a1)); ctx.stroke(); ctx.restore(); }
    a0 += 2 * Math.PI * v; });
}
function eixo(x0, x1, y, v0, v1, marcas, a, fmt = v => v + '%') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a * 2);
  ctx.strokeStyle = 'rgba(244,248,255,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * ease(clamp(a)), y); ctx.stroke();
  marcas.forEach(m => { const x = x0 + (m - v0) / (v1 - v0) * (x1 - x0); ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12); ctx.stroke();
    txt(fmt(m), x, y + 50, ARC, 30, 'rgba(244,248,255,.6)', { align: 'center', weight: 600 }); });
  ctx.restore();
}
function marco(x, y, a, cor, rot, cima = true, r = 18) {
  if (a <= 0) return; const e = back(clamp(a));
  ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.fillStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(x, y, r * e, 0, 7); ctx.fill(); ctx.restore();
  if (rot) txt(rot, x, y + (cima ? -50 : 60), EXP, 36, cor, { align: 'center', alpha: clamp(a * 2) });
}
function carimbo(str, x, y, a, cor, rot = -.05, size = 52) {
  if (a <= 0) return; const w = measure(str, EXP, size) + 70; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const e = back(clamp(a)); ctx.scale(e, e); ctx.globalAlpha *= clamp(a * 2);
  ctx.strokeStyle = cor; ctx.lineWidth = 6; ctx.shadowColor = cor; ctx.shadowBlur = 20; rr(-w / 2, -size, w, size * 2, 16); ctx.stroke(); txt(str, 0, 3, EXP, size, cor, { align: 'center' }); ctx.restore();
}
const rnd = k => ((k * 9301 + 49297) % 233280) / 233280;
const ORDEM = [...Array(400).keys()].sort((a, b) => rnd(a + 7) - rnd(b + 7)), POS = []; ORDEM.forEach((d, i) => POS[d] = i);

// aparelho escuro (celular ou tela), conteúdo desenhado dentro com clip
function aparelho(x, y, w, h, a, cor, conteudo) {
  if (a <= 0) return; const e = .9 + .1 * back(clamp(a));
  ctx.save(); ctx.globalAlpha *= clamp(a * 1.5); ctx.translate(x + w / 2, y + h / 2); ctx.scale(e, e); ctx.translate(-x - w / 2, -y - h / 2);
  ctx.shadowColor = hex(cor, .7); ctx.shadowBlur = 50; ctx.fillStyle = '#060a15'; rr(x, y, w, h, 46); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = cor; ctx.lineWidth = 5; rr(x, y, w, h, 46); ctx.stroke();
  ctx.save(); rr(x + 14, y + 14, w - 28, h - 28, 34); ctx.clip(); conteudo(x + 14, y + 14, w - 28, h - 28); ctx.restore();
  ctx.restore();
}
// título de passo: número grande + nome do passo
function passo(n, nome, t0, t1, t, hot = '', cor = CI) {
  numero(n, 230, t0, t1, t);
  titulo(nome, 390, t0 + .1, t1, t, 70, BR, hot, cor);
}
function onda(x, y, w, h, t, cor, a, fase = 0, falha = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 16; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let k = 0; k < 24; k++) { const xx = x + k * w / 23, amp = h * (.25 + .75 * Math.abs(Math.sin(k * .9 + t * 7 + fase))) * (falha && k % 5 === 0 ? .1 : 1);
    ctx.beginPath(); ctx.moveTo(xx, y - amp / 2); ctx.lineTo(xx, y + amp / 2); ctx.stroke(); }
  ctx.restore();
}
function papel(x, y, w, h, a, linhas, o = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.shadowColor = hex(o.cor || CI, .6); ctx.shadowBlur = 30; ctx.fillStyle = '#f4f7ff'; rr(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.shadowBlur = 0;
  linhas.forEach((l, i) => txt(l, -w / 2 + 26, -h / 2 + 46 + i * 40, ARC, o.size || 28, '#1b2440', { weight: 600 }));
  if (o.qr) { const s = 70, qx = w / 2 - s - 20, qy = h / 2 - s - 20; for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if ((i * 7 + j * 3 + i * j) % 3 !== 1 || (i < 2 && j < 2)) { ctx.fillStyle = '#1b2440'; ctx.fillRect(qx + i * s / 7, qy + j * s / 7, s / 7, s / 7); } }
  ctx.restore();
}
