// Kit visual "Raio-X" do IA Sem Mistério (identidade aprovada pelo Diego em 08/10/2026).
// Ideia: cada vídeo abre a ferramenta como uma planta técnica e mostra o que tem dentro.
// Regras: fundo azul de planta com grade fina, objetos em traço (linha), anotações com setas, transição por linha de scan.
// Nada de brilho (glow), partículas, chão em perspectiva ou título centralizado com neon. Ciano só em destaque e anotação.
// Uso: no HTML do vídeo, carregar as @font-face (ver modelo) + <script src="raiox-kit.js">, definir EP, SC, CAPS e SCENES.
const W = 1080, H = 1920;
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const COL = { paper: '#0a1d45', minor: 'rgba(130,175,255,.07)', major: 'rgba(130,175,255,.16)', ink: '#dbe7ff', blue: '#2f6bff', cyan: '#2ee6ff', black: '#02060f', dim: '#7c93c4', ok: '#3ddc84', red: '#ff5a76' };
const EXP = '"AX", sans-serif', ARC = '"AR", sans-serif';
const M = 90; // margem lateral

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const typed = (str, p) => str.slice(0, Math.round(str.length * clamp(p)));

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function txt(str, x, y, f, size, color, o = {}) {
  ctx.save();
  ctx.font = `${o.weight ?? 800} ${size}px ${f}`;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
  ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.ls) ctx.letterSpacing = o.ls + 'px';
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.restore();
}
function measure(str, f, size, weight = 800, ls = 0) { ctx.save(); ctx.font = `${weight} ${size}px ${f}`; if (ls) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(str).width; ctx.restore(); return w; }
function wrap(str, maxW, f, size, weight = 800) {
  const words = str.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (measure(t, f, size, weight) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
// desenha um traço progressivamente (p de 0 a 1); L = comprimento aproximado do caminho
function draw(p, L, fn) { if (p <= 0) return; ctx.save(); ctx.setLineDash([L * clamp(p), L]); fn(); ctx.restore(); }

// ---------- fundo: papel de planta ----------
function bg(t) {
  ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= W; x += 30) { ctx.strokeStyle = x % 150 ? COL.minor : COL.major; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 30) { ctx.strokeStyle = y % 150 ? COL.minor : COL.major; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * .75);
  vg.addColorStop(0, 'rgba(6,20,51,0)'); vg.addColorStop(1, 'rgba(2,6,15,.75)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(40, 40, W - 80, H - 80);
  txt(`IA SEM MISTÉRIO · PRANCHA ${typeof EP !== 'undefined' ? EP : '00'}`, 70, H - 75, ARC, 22, COL.dim, { weight: 600, ls: 3 });
  txt(`ESC 1:1 · ${t.toFixed(1)}s`, W - 70, H - 75, ARC, 22, COL.dim, { align: 'right', weight: 600, ls: 3 });
}

// ---------- cabeçalho de cena ----------
// título em caixa alta (Archivo Expanded), à esquerda; hl = linha em ciano
function title(lines, lt, t0 = 0, y = 200, size = 92, hl = -1) {
  lines.forEach((s, i) => {
    const d = t0 + i * .12, q = easeOut(prog(lt, d, d + .3));
    txt(s.toUpperCase(), M - (1 - q) * 30, y + i * size * 1.18, EXP, size, i === hl ? COL.cyan : COL.ink, { alpha: q });
  });
}
// legenda técnica sob o título: "FIG. 02 — VISTA EXPLODIDA"
function fig(str, lt, t0 = .3, y = 470) { txt(str.toUpperCase(), M, y, ARC, 26, COL.dim, { weight: 600, ls: 4, alpha: prog(lt, t0, t0 + .3) }); }
// selo do passo: número dentro de um círculo traçado, à direita na linha da legenda técnica (fig)
function stepTag(n, total, lt, y = 470) {
  const p = prog(lt, 0, .4); if (p <= 0) return;
  const x = W - M - 34;
  draw(p, 220, () => { ctx.strokeStyle = COL.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 34, -Math.PI / 2, Math.PI * 1.5); ctx.stroke(); });
  txt(String(n), x, y + 2, EXP, 34, COL.cyan, { align: 'center', alpha: prog(p, .4, 1) });
  txt(`PASSO`, x - 50, y - 12, ARC, 20, COL.dim, { align: 'right', weight: 600, ls: 3, alpha: prog(p, .4, 1) });
  txt(`DE ${total}`, x - 50, y + 14, ARC, 20, COL.dim, { align: 'right', weight: 600, ls: 3, alpha: prog(p, .4, 1) });
}

// ---------- peças em traço ----------
// painel traçado com marcas de canto e rótulo em cima ("JANELA · CHATGPT")
function panel(x, y, w, h, p, label = '') {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 3;
  draw(p, 2 * (w + h), () => ctx.strokeRect(x, y, w, h));
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 5; const k = 26; const a = prog(p, .6, 1);
  ctx.globalAlpha = a;
  [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([px, py, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(px + sx * k, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * k); ctx.stroke();
  });
  if (label) txt(label.toUpperCase(), x, y - 26, ARC, 24, COL.cyan, { weight: 600, ls: 4 });
  ctx.restore();
}
// anotação: ponto + linha de chamada + texto
function annot(x1, y1, x2, y2, label, a, side = 'R', color = COL.ink) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a * 2);
  ctx.fillStyle = COL.cyan; ctx.beginPath(); ctx.arc(x1, y1, 9, 0, 7); ctx.fill();
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; const e = easeOut(clamp(a));
  const xm = lerp(x1, x2, e), ym = lerp(y1, y2, e);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xm, ym); ctx.lineTo(xm + (side === 'R' ? 50 : -50) * e, ym); ctx.stroke();
  txt(label, x2 + (side === 'R' ? 64 : -64), y2, ARC, 34, color, { align: side === 'R' ? 'left' : 'right', weight: 600, alpha: prog(a, .6, 1) });
  ctx.restore();
}
// cota (linha de medida) com texto no meio
function dimLine(x1, x2, y, label, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.strokeStyle = COL.dim; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y - 14); ctx.lineTo(x1, y + 14); ctx.moveTo(x2, y - 14); ctx.lineTo(x2, y + 14); ctx.stroke();
  const w = measure(label, ARC, 26, 600, 4) + 40; const m = (x1 + x2) / 2;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(m - w / 2, y); ctx.moveTo(m + w / 2, y); ctx.lineTo(x2, y); ctx.stroke();
  txt(label.toUpperCase(), m, y, ARC, 26, COL.dim, { align: 'center', weight: 600, ls: 4 });
  ctx.restore();
}
// régua de progresso: traço que avança sobre marcas de 10 em 10%
function ruler(x, y, w, p, label = '') {
  ctx.save(); ctx.strokeStyle = COL.dim; ctx.lineWidth = 2;
  for (let i = 0; i <= 10; i++) { const xx = x + w * i / 10; ctx.beginPath(); ctx.moveTo(xx, y - (i % 5 ? 10 : 18)); ctx.lineTo(xx, y); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * clamp(p), y); ctx.stroke();
  txt(`${Math.round(clamp(p) * 100)}%${label ? ' · ' + label : ''}`, x + w, y + 40, ARC, 30, p >= 1 ? COL.cyan : COL.ink, { align: 'right', weight: 600 });
  ctx.restore();
}
// envelope em traço
function envelope(x, y, w, h, p) {
  ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  draw(p, 2 * (w + h), () => ctx.strokeRect(x, y, w, h));
  draw(prog(p, .3, 1), w * 1.3, () => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w / 2, y + h * .55); ctx.lineTo(x + w, y); ctx.stroke(); });
  ctx.restore();
}
// folha de documento em traço, com linhas de texto
function page(x, y, w, h, p, fill = false) {
  ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4;
  if (fill && p > .5) { ctx.fillStyle = COL.blue; ctx.globalAlpha = prog(p, .5, 1); ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
  draw(p, 2 * (w + h), () => ctx.strokeRect(x, y, w, h));
  if (!fill) { ctx.lineWidth = 3; ctx.globalAlpha = prog(p, .5, 1); for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x + w * .15, y + h * .2 + k * h * .11); ctx.lineTo(x + w * (k % 3 === 2 ? .55 : .85), y + h * .2 + k * h * .11); ctx.stroke(); } }
  ctx.restore();
}
// caixa de prompt: texto sendo digitado dentro de um painel traçado
function promptBox(x, y, w, str, p, t, label = 'pedido') {
  const all = wrap(str, w - 70, ARC, 34, 600); const h = all.length * 50 + 60;
  panel(x, y, w, h, prog(p * 4, 0, 1), label);
  const lines = wrap(typed(str, p) || ' ', w - 70, ARC, 34, 600);
  lines.forEach((l, i) => txt(l, x + 36, y + 55 + i * 50, ARC, 34, COL.ink, { weight: 600 }));
  if (p < 1 && Math.floor(t * 2.2) % 2 === 0) { const last = lines[lines.length - 1]; ctx.fillStyle = COL.cyan; ctx.fillRect(x + 40 + measure(last, ARC, 34, 600), y + 55 + (lines.length - 1) * 50 - 20, 4, 40); }
  return h;
}
// ferramenta real (Canva, Hotmart...): moldura traçada, só o quadrado tem a cor da marca
function toolCard(x, y, name, sub, a, accent) {
  if (a <= 0) return;
  const w = Math.max(measure(name, EXP, 40), measure(sub, ARC, 26, 600)) + 170;
  ctx.save(); ctx.globalAlpha *= clamp(a * 2);
  panel(x - w / 2, y - 62, w, 124, clamp(a));
  ctx.fillStyle = accent; ctx.fillRect(x - w / 2 + 22, y - 40, 80, 80);
  txt(name[0], x - w / 2 + 62, y + 2, EXP, 46, '#ffffff', { align: 'center' });
  txt(name, x - w / 2 + 125, y - 16, EXP, 40, COL.ink);
  txt(sub, x - w / 2 + 125, y + 30, ARC, 26, COL.dim, { weight: 600 });
  ctx.restore();
}
// carimbo de destaque: retângulo ciano chapado com texto escuro, levemente girado
function stamp(x, y, str, a, size = 34) {
  if (a <= 0) return;
  const p = back(clamp(a)); const w = measure(str.toUpperCase(), EXP, size) + 50;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.fillStyle = COL.cyan; ctx.fillRect(-w / 2, -size * .9, w, size * 1.8);
  txt(str.toUpperCase(), 0, 2, EXP, size, COL.black, { align: 'center' }); ctx.restore();
}
// riscar um texto (revisão)
function strike(x, y, w, p, color = COL.red) { if (p <= 0) return; ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * clamp(p), y); ctx.stroke(); }

// ---------- marca ----------
// lente de inspeção com "IA" dentro e marcas de mira
function lens(cx, cy, r, p = 1) {
  ctx.save(); ctx.lineCap = 'round';
  draw(p, 2 * Math.PI * r, () => { ctx.strokeStyle = COL.ink; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 1.5); ctx.stroke(); });
  const q = prog(p, .5, 1);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = r * .04;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2; const r1 = r * 1.12, r2 = r * (1.12 + .22 * q);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke();
  }
  ctx.strokeStyle = COL.ink; ctx.lineWidth = r * .1;
  const h = r * .55 * q; const a45 = Math.PI / 4;
  ctx.beginPath(); ctx.moveTo(cx + Math.cos(a45) * r * 1.05, cy + Math.sin(a45) * r * 1.05);
  ctx.lineTo(cx + Math.cos(a45) * (r * 1.05 + h), cy + Math.sin(a45) * (r * 1.05 + h)); ctx.stroke();
  txt('IA', cx, cy + r * .04, EXP, r * .62, COL.ink, { align: 'center', alpha: q });
  ctx.fillStyle = COL.blue; ctx.globalAlpha = q; ctx.fillRect(cx - r * .42, cy + r * .4, r * .84, r * .07);
  ctx.restore();
}
// final: lente + nome + cota + carimbo do CTA (posicionado acima da faixa de legenda)
function endCard(t, t0, cta = 'salva e segue') {
  const lt = t - t0; if (lt < 0) return;
  ctx.save(); ctx.fillStyle = COL.paper; ctx.globalAlpha = prog(lt, 0, .25); ctx.fillRect(42, 42, W - 84, H - 84); ctx.restore(); // cobre a cena inteira: nada aparece por trás do card
  lens(W / 2, 790, 140, prog(lt, 0, .8));
  txt('IA SEM MISTÉRIO', W / 2, 1040, EXP, 62, COL.ink, { align: 'center', alpha: prog(lt, .5, .8) });
  dimLine(160, 920, 1110, 'por dentro da IA', prog(lt, .7, 1.0));
  stamp(W / 2, 1250, cta, prog(lt, .9, 1.3), 46);
}

// ---------- legenda (faixa y≈1440–1530) ----------
// frase inteira em caixa preta com cantos de mira; palavra falada no momento em ciano
function captions(t) {
  const cap = CAPS.find(k => t >= k[0] && t < k[1]); if (!cap) return;
  const [a, b, str] = cap; const ws = str.split(' '); const d = (b - a) / ws.length; const size = 50;
  const lines = []; let cur = []; let lw = 0;
  ws.forEach((w, i) => { const ww = measure(w + ' ', ARC, size, 600); if (lw + ww > 840 && cur.length) { lines.push(cur); cur = []; lw = 0; } cur.push({ w, ww, i }); lw += ww; });
  lines.push(cur);
  const y0 = 1470, bh = lines.length * 72 + 40, by = y0 - 56;
  ctx.fillStyle = COL.black; ctx.fillRect(80, by, 920, bh);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 5; const k = 30;
  [[80, by, 1, 1], [1000, by, -1, 1], [80, by + bh, 1, -1], [1000, by + bh, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x + sx * k, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * k); ctx.stroke();
  });
  const ci = Math.min(ws.length - 1, Math.floor((t - a) / d));
  lines.forEach((ln, li) => {
    const lwid = ln.reduce((s, w) => s + w.ww, 0); let x = W / 2 - lwid / 2; const y = y0 + li * 72;
    ln.forEach(w => { txt(w.w, x, y, ARC, size, w.i === ci ? COL.cyan : COL.ink, { weight: 600 }); x += w.ww; });
  });
}

// ---------- montagem ----------
// troca de cena: linha de scan ciano desce em 0,35s revelando a cena nova (substitui o flash de brilho)
function render(t) {
  ctx.save(); ctx.clearRect(0, 0, W, H);
  let i = SCENES.length - 1; for (let k = 0; k < SCENES.length; k++) if (t < SC[k + 1]) { i = k; break; }
  const lt = t - SC[i];
  bg(t); SCENES[i](t, lt);
  if (i > 0 && lt < .35) {
    const y = H * easeInOut(lt / .35);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, H - y); ctx.clip();
    bg(t); SCENES[i - 1](t, t - SC[i - 1]); ctx.restore();
    ctx.fillStyle = 'rgba(46,230,255,.18)'; ctx.fillRect(0, y - 70, W, 70);
    ctx.fillStyle = COL.cyan; ctx.fillRect(0, y - 3, W, 6);
  }
  captions(t);
  ctx.restore();
}
window.render = render;
