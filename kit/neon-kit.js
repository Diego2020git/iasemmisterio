// Kit NEON (teste 2 de 17 a 23/10/2026, escolha do Diego): extraído de kit/marca-apresentacao-neon.html.
// Carregar DEPOIS de raiox-kit.js. A página define: DURATION, SC (= TEMPOS.cenas), COR (cor da luz por cena),
// S (funções das cenas, (t, lt) => ...), CK (keyframes do cursor [t, x, y, tamanho, giro]), CLIQUES (tempos de clique),
// HITS (tempos das palavras-chave, toque na trilha) e IMPACTO (tempo do impacto da logo no fim).
// Layout: um elemento por vez, centro em y≈860; nada abaixo de y 1650 nem à direita de x 960.
const PAL = TEMPOS.palavras, BEAT = .5;
const LOGO = document.getElementById('logo');
const ease = easeInOut, sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const normN = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
// tempo absoluto em que a palavra começa (n-ésima ocorrência na cena)
function wt(word, cena, n = 1) { let k = 0; for (const p of PAL) if (p.cena === cena && normN(p.w) === normN(word) && ++k === n) return p.t0; throw new Error('wt ' + word + ' cena ' + cena); }
const AZ = '#2f6bff', CI = '#2ee6ff', IN = '#4f5bff', BR = '#f4f8ff';
const hex = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
var cx0 = W / 2, cy0 = 860; // centro do palco (acima da área da descrição do Reels)

// ---------- fundo ----------
const grain = document.createElement('canvas'); grain.width = grain.height = 256;
{ const g = grain.getContext('2d'), d = g.createImageData(256, 256); let s = 11;
  for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = s % 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
function luz(x, y, rx, ry, color, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, hex(color, a)); g.addColorStop(.5, hex(color, a * .35)); g.addColorStop(1, hex(color, 0));
  ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore();
}
function fundo(t, i, p) {
  ctx.fillStyle = '#030408'; ctx.fillRect(0, 0, W, H);
  const b = Math.pow(1 - (t % BEAT) / BEAT, 3) * (t > 3 ? 1 : .4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  luz(780, -100, 900, 700, '#8a94a8', .22); // névoa cinza de cima, como na referência
  const cA = COR[Math.max(0, i - 1)], cB = COR[i], k = i > 0 ? p : 1;
  luz(300 + 80 * Math.sin(t * .4), 1950, 900, 900, cA, .55 * (1 - k) * (1 + .15 * b));
  luz(300 + 80 * Math.sin(t * .4), 1950, 900, 900, cB, .55 * k * (1 + .15 * b));
  luz(950, 1500 + 80 * Math.cos(t * .3), 500, 700, AZ, .12);
  ctx.restore();
}
function acabamento(t) {
  ctx.save(); ctx.globalAlpha = .07; ctx.globalCompositeOperation = 'overlay';
  const f = Math.floor(t * 30); ctx.translate(-(f * 73) % 256, -(f * 151) % 256);
  ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H * .45, 350, W / 2, H * .45, H * .85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

// ---------- texto limpo no centro, com rastro de luz ----------
// revela da esquerda pra direita; um risco de luz azul acompanha a borda da revelação
function frase(str, y, t0, t1, size = 82, o = {}) {
  const t = o.t; if (t < t0 - .05 || t > t1 + .35) return;
  const fade = 1 - prog(t, t1, t1 + .3), w = measure(str, ARC, size, 600), x = W / 2 - w / 2;
  const p = ease(prog(t, t0, t0 + Math.max(.35, Math.min(.8, str.length * .045))));
  ctx.save(); ctx.globalAlpha = fade;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - size, (w + 40) * p, size * 2); ctx.clip();
  ctx.shadowColor = hex(o.cor || AZ, .7); ctx.shadowBlur = 30;
  txt(str, W / 2, y, ARC, size, BR, { align: 'center', weight: 600 });
  if (o.hot) { const hw = measure(o.hot, ARC, size, 600), hx = W / 2 - w / 2 + measure(str.slice(0, str.indexOf(o.hot)), ARC, size, 600);
    ctx.shadowColor = CI; ctx.shadowBlur = 40; txt(o.hot, hx, y, ARC, size, CI, { weight: 600 }); }
  ctx.restore();
  if (p > 0 && p < 1) { // rastro de luz
    const ex = x - 20 + (w + 40) * p; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(ex - 160, 0, ex + 20, 0); g.addColorStop(0, hex(AZ, 0)); g.addColorStop(1, hex(CI, .9));
    ctx.fillStyle = g; rr(ex - 160, y + size * .1, 180, size * .16, size * .08); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ---------- 3D: forma extrudada com brilho ----------
// path(): desenha o caminho num quadrado de -100..100. ry = giro em Y, rx = giro em X (inclinação)
function neon3d(path, x, y, s, ry, rx, cor, a = 1, cheio = .25) {
  if (a <= 0) return;
  const cy = Math.cos(ry), sy = Math.sin(ry), D = 26;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (let k = D; k >= 1; k -= 2) { // camadas de profundidade
    ctx.save(); ctx.translate(x - sy * k * s / 100 * 1.4, y + Math.sin(rx) * k * s / 100); ctx.scale(cy * s / 100, Math.cos(rx) * s / 100);
    path(); ctx.fillStyle = hex(cor, .05 + .1 * (1 - k / D)); ctx.fill();
    ctx.lineWidth = 6 * 100 / s; ctx.strokeStyle = hex(cor, .25 * (1 - k / D) + .05); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(cy * s / 100, Math.cos(rx) * s / 100); path();
  const g = ctx.createLinearGradient(-100, -100, 100, 100); g.addColorStop(0, hex(cor, cheio + .15)); g.addColorStop(1, hex(cor, cheio * .3));
  ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = cor; ctx.shadowBlur = 50; ctx.lineWidth = 9 * 100 / s; ctx.strokeStyle = cor; ctx.stroke();
  ctx.shadowBlur = 12; ctx.lineWidth = 3.5 * 100 / s; ctx.strokeStyle = '#eaffff'; ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; luz(x, y, s * 1.8, s * 1.8, cor, .22 * a); ctx.restore();
  ctx.restore();
}
// caminhos (quadrado -100..100)
const P = {
  engrenagem() { ctx.beginPath(); const n = 8; for (let i = 0; i < n * 2; i++) { const a0 = i * Math.PI / n, r = i % 2 ? 72 : 98, da = Math.PI / n * .38;
      ctx.lineTo(Math.cos(a0 - da) * r, Math.sin(a0 - da) * r); ctx.lineTo(Math.cos(a0 + da) * r, Math.sin(a0 + da) * r); } ctx.closePath();
    ctx.moveTo(36, 0); ctx.arc(0, 0, 36, 0, Math.PI * 2, true); },
  relogio() { ctx.beginPath(); ctx.arc(0, 0, 96, 0, 7); ctx.moveTo(78, 0); ctx.arc(0, 0, 78, 0, Math.PI * 2, true); },
  coracao() { ctx.beginPath(); ctx.moveTo(0, 85); ctx.bezierCurveTo(-140, -10, -70, -125, 0, -50); ctx.bezierCurveTo(70, -125, 140, -10, 0, 85); ctx.closePath(); },
  balao() { ctx.beginPath(); rr(-100, -75, 200, 130, 40); ctx.moveTo(-40, 55); ctx.lineTo(-70, 100); ctx.lineTo(0, 55); },
  seta() { ctx.beginPath(); ctx.moveTo(-60, -95); ctx.lineTo(70, 30); ctx.lineTo(8, 34); ctx.lineTo(45, 100); ctx.lineTo(15, 112); ctx.lineTo(-20, 46); ctx.lineTo(-62, 88); ctx.closePath(); },
  check() { ctx.beginPath(); ctx.arc(0, 0, 96, 0, 7); ctx.moveTo(-48, 2); ctx.lineTo(-12, 40); ctx.lineTo(52, -38); ctx.lineTo(40, -50); ctx.lineTo(-12, 14); ctx.lineTo(-36, -10); ctx.closePath(); },
};

// ---------- celular ----------
function celular(x, y, s, ry, a, conteudo, app = 'Atendimento', cor = AZ) {
  if (a <= 0) return; const w = 430 * s, h = 880 * s;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.transform(Math.cos(ry), Math.sin(ry) * .22, 0, 1, 0, 0);
  for (let k = 14; k >= 1; k -= 2) { ctx.fillStyle = `rgba(150,170,210,${.06 + .02 * (14 - k) / 14})`; rr(-w / 2 - Math.sin(ry) * k * 2, -h / 2 + k * .4, w, h, 64 * s); ctx.fill(); }
  ctx.shadowColor = hex(AZ, .6); ctx.shadowBlur = 60; ctx.fillStyle = '#1b1f2a'; rr(-w / 2, -h / 2, w, h, 64 * s); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#9aa6bf'; ctx.lineWidth = 4; rr(-w / 2, -h / 2, w, h, 64 * s); ctx.stroke();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#f4f7ff'); g.addColorStop(1, '#dfe7fb');
  ctx.fillStyle = g; rr(-w / 2 + 14 * s, -h / 2 + 14 * s, w - 28 * s, h - 28 * s, 52 * s); ctx.fill();
  ctx.fillStyle = '#0b0d12'; rr(-60 * s, -h / 2 + 30 * s, 120 * s, 34 * s, 17 * s); ctx.fill();
  ctx.fillStyle = '#e6ecfa'; ctx.fillRect(-w / 2 + 14 * s, -h / 2 + 80 * s, w - 28 * s, 90 * s); // topo do app
  ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(-w / 2 + 70 * s, -h / 2 + 125 * s, 26 * s, 0, 7); ctx.fill();
  txt(app, -w / 2 + 112 * s, -h / 2 + 125 * s, ARC, 28 * s, '#1b2440', { weight: 600 });
  ctx.save(); rr(-w / 2 + 14 * s, -h / 2 + 170 * s, w - 28 * s, h - 200 * s, 0); ctx.clip(); conteudo(-w / 2 + 34 * s, -h / 2 + 200 * s, w - 68 * s, s); ctx.restore();
  // reflexo
  ctx.globalCompositeOperation = 'lighter'; const r = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(.45, 'rgba(255,255,255,.08)'); r.addColorStop(.5, 'rgba(255,255,255,0)'); ctx.fillStyle = r; rr(-w / 2, -h / 2, w, h, 64 * s); ctx.fill();
  ctx.restore();
}
function msg(x, y, w, str, eu, a, s) {
  if (a <= 0) return 0; const size = 33 * s, lines = wrap(str, w * .78 - 30 * s, ARC, size, 600), bw = Math.max(...lines.map(l => measure(l, ARC, size, 600))) + 34 * s, bh = lines.length * size * 1.3 + 22 * s;
  const bx = eu ? x + w - bw : x, e = back(clamp(a));
  ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.translate(bx + bw / 2, y + bh / 2); ctx.scale(e, e); ctx.translate(-bx - bw / 2, -y - bh / 2);
  ctx.fillStyle = eu ? '#cfe0ff' : '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,.12)'; ctx.shadowBlur = 8; rr(bx, y, bw, bh, 18 * s); ctx.fill(); ctx.shadowBlur = 0;
  lines.forEach((l, i) => txt(l, bx + 17 * s, y + 11 * s + size * .65 + i * size * 1.3, ARC, size, '#1b2440', { weight: 600 }));
  ctx.restore(); return bh + 14 * s;
}

// ---------- roda de cartões (como os logos em círculo da referência) ----------
const IC = [
  (c) => { ctx.strokeStyle = c; ctx.lineWidth = 7; rr(-34, -28, 68, 46, 12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-14, 18); ctx.lineTo(-24, 34); ctx.lineTo(2, 18); ctx.stroke(); }, // chat
  (c) => { ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-28, 22); ctx.lineTo(0, -20); ctx.lineTo(28, 22); ctx.stroke(); [[-28, 22], [0, -20], [28, 22]].forEach(p => { ctx.fillStyle = c; ctx.fillRect(p[0] - 10, p[1] - 10, 20, 20); }); }, // fluxo
  (c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(16, -18); ctx.lineTo(36, 0); ctx.lineTo(16, 18); ctx.lineTo(-36, 18); ctx.closePath(); ctx.fill(); txt('R$0', -10, 1, EXP, 17, '#fff', { align: 'center' }); }, // grátis
  (c) => { ctx.strokeStyle = c; ctx.lineWidth = 6; rr(-30, -26, 60, 54, 8); ctx.stroke(); ctx.fillStyle = c; ctx.fillRect(-30, -26, 60, 14); txt('19', 0, 12, EXP, 22, c, { align: 'center' }); }, // agenda
  (c) => { ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.strokeRect(-34, -22, 68, 46); ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(0, 6); ctx.lineTo(34, -22); ctx.stroke(); }, // e-mail
  (c) => { ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.strokeRect(-32, -28, 64, 56); for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-32, -28 + i * 19); ctx.lineTo(32, -28 + i * 19); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-6, -28); ctx.lineTo(-6, 28); ctx.stroke(); }, // planilha
  (c) => { ctx.fillStyle = c; rr(-36, -26, 72, 52, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(16, 0); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fill(); }, // vídeo
  (c) => { ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.stroke(); txt('IA', 0, 2, EXP, 24, c, { align: 'center' }); }, // ia
];
function roda(t, t0, rot, a) {
  if (a <= 0) return; const n = IC.length, R = 330 * (.6 + .4 * ease(a));
  const itens = IC.map((f, i) => { const an = i * 2 * Math.PI / n + rot - Math.PI / 2; return { f, i, an, z: Math.sin(an) }; }).sort((p, q) => p.z - q.z);
  itens.forEach(({ f, i, an, z }) => {
    const ai = clamp((a * n - i * .5) / 2); if (ai <= 0) return;
    const x = cx0 + Math.cos(an) * R, y = cy0 + Math.sin(an) * R * .92, s = 1 + .08 * z, e = back(ai);
    ctx.save(); ctx.translate(x, y); ctx.rotate(.35 * Math.cos(an * 1.3 + t * .5)); ctx.transform(1, 0, .18 * Math.sin(an + t), 1, 0, 0); ctx.scale(s * e, s * e); ctx.globalAlpha = clamp(ai * 2);
    ctx.fillStyle = 'rgba(120,140,190,.35)'; rr(-62, -52, 136, 136, 22); ctx.fill(); // espessura
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillStyle = '#f6f8ff'; rr(-68, -68, 136, 136, 22); ctx.fill(); ctx.shadowBlur = 0;
    IC[i]([AZ, '#1d4ed8', CI === '#2ee6ff' ? '#0aa5c0' : CI, AZ, '#1d4ed8', '#0aa5c0', AZ, '#1d4ed8'][i]);
    ctx.restore();
  });
}


// ---------- cursor 3D que acompanha o vídeo ----------
function cursor(t) {
  let i = 0; while (i < CK.length - 1 && t >= CK[i + 1][0]) i++;
  const A = CK[i], B = CK[Math.min(i + 1, CK.length - 1)], q = B[0] > A[0] ? ease(prog(t, A[0], B[0])) : 1;
  const v = A.map((a, k) => lerp(a, B[k], q)); if (v[3] < 2) return;
  const clique = CLIQUES.reduce((m, c) => Math.max(m, 1 - Math.abs(t - c - .05) / .15), 0);
  neon3d(P.seta, v[1], v[2] + 10 * Math.sin(t * 2.4), v[3] * (1 - .15 * Math.max(0, clique)), v[4] + .25 * Math.sin(t * 1.3), .3, AZ, 1, .55);
}
// ---------- selo de confirmação (pílula com check) ----------
function selo(str, x, y, a, cor = CI, fade = 1) {
  if (a <= 0) return; const e = back(clamp(a)), w = measure('✓ ' + str, ARC, 36, 600) + 50;
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha = clamp(a * 2) * fade;
  ctx.shadowColor = cor; ctx.shadowBlur = 25; ctx.fillStyle = 'rgba(10,30,60,.85)'; rr(-w / 2, -36, w, 72, 36); ctx.fill();
  ctx.strokeStyle = cor; ctx.lineWidth = 3; rr(-w / 2, -36, w, 72, 36); ctx.stroke(); ctx.shadowBlur = 0;
  txt('✓ ' + str, 0, 2, ARC, 36, BR, { align: 'center', weight: 600 }); ctx.restore();
}
// ---------- etiqueta "exemplo ilustrativo" (toda simulação leva) ----------
function exemplo(x, y, a = 1) { if (a <= 0) return; txt('EXEMPLO ILUSTRATIVO', x, y, ARC, 24, CI, { align: 'center', weight: 600, ls: 3, alpha: .8 * clamp(a) }); }
// ---------- final: logo original + chamada ----------
function fim(t, lt, cta = 'Salva e segue', sub = '') {
  const e = back(prog(lt, .05, .6)), s = 460;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; luz(cx0, cy0 - 60, 560, 560, AZ, .35 * prog(lt, 0, .5)); ctx.restore();
  ctx.save(); ctx.translate(cx0, cy0 - 60); const z = .7 + .3 * e + .02 * lt; ctx.scale(z, z); ctx.globalAlpha = prog(lt, 0, .3);
  ctx.shadowColor = CI; ctx.shadowBlur = 60; ctx.fillStyle = '#0a1d45'; rr(-s / 2, -s / 2, s, s, 64); ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); rr(-s / 2, -s / 2, s, s, 64); ctx.clip(); ctx.drawImage(LOGO, -s / 2, -s / 2, s, s);
  const sx = lerp(-s, s, prog(lt, .5, 1.3)), g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.restore();
  ctx.restore();
  const a = prog(lt, .4, .75); if (a > 0) { const w = measure(cta, ARC, 52, 600) + 90, eb = back(a);
    ctx.save(); ctx.translate(cx0, cy0 + 300); ctx.scale(eb, eb); ctx.shadowColor = CI; ctx.shadowBlur = 40; ctx.fillStyle = CI; rr(-w / 2, -48, w, 96, 48); ctx.fill(); ctx.shadowBlur = 0;
    txt(cta, 0, 2, ARC, 52, '#03121a', { align: 'center', weight: 600 }); ctx.restore(); }
  if (sub) txt(sub, cx0, cy0 + 420, ARC, 38, BR, { align: 'center', weight: 600, alpha: prog(lt, .6, .9) });
}
// ---------- montagem ----------
const TR = .5;
function cena(i, t, alpha, zoom, blur = 0) {
  if (alpha <= 0) return; const lt = t - SC[i];
  ctx.save(); ctx.globalAlpha = alpha; if (blur > .5) ctx.filter = `blur(${blur}px)`;
  const z = zoom * (1 + .02 * lt); ctx.translate(cx0, cy0); ctx.scale(z, z); ctx.translate(-cx0, -cy0);
  S[i](t, lt); ctx.restore();
}
function render(t) {
  ctx.save(); ctx.clearRect(0, 0, W, H);
  let i = S.length - 1; for (let k = 0; k < S.length; k++) if (t < SC[k + 1]) { i = k; break; }
  const lt = t - SC[i], p = i > 0 ? ease(clamp(lt / TR)) : 1;
  fundo(t, i, p);
  if (i > 0 && lt < TR) { // zoom + desfoque + clarão de luz entre as cenas
    cena(i - 1, t, 1 - p, 1 + .25 * p, 18 * p);
    cena(i, t, p, .85 + .15 * p, 18 * (1 - p));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; luz(cx0, cy0, 900, 700, COR[i], .35 * Math.sin(p * Math.PI)); ctx.restore();
  } else cena(i, t, 1, 1);
  cursor(t);
  acabamento(t);
  ctx.restore();
}
window.render = render;
// ---------- trilha (Web Audio): mesma da apresentação, com tempos do vídeo ----------
async function renderAudio() {
  const SR = 48000, ac = new OfflineAudioContext(2, Math.ceil(DURATION * SR), SR);
  const mix = ac.createGain(); mix.gain.value = .9; mix.connect(ac.destination);
  const noiseBuf = ac.createBuffer(1, SR * 2, SR); { const d = noiseBuf.getChannelData(0); let s = 3; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; } }
  const env = (g, t0, a, peak, dec) => { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(.0001, t0 + a + dec); };
  const osc = (type, f, t0, dur, peak, a = .005, dest = mix) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; o.connect(g); g.connect(dest); env(g, t0, a, peak, dur); o.start(t0); o.stop(t0 + a + dur + .05); return o; };
  const noise = (t0, dur, peak, type, f0, f1, a = .005, q = 1) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + a + dur); s.connect(f); f.connect(g); g.connect(mix); env(g, t0, a, peak, dur); s.start(t0); s.stop(t0 + a + dur + .05); };
  // eco curto pra dar espaço
  const dl = ac.createDelay(); dl.delayTime.value = .375; const fb = ac.createGain(); fb.gain.value = .3; const wet = ac.createGain(); wet.gain.value = .25;
  dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(mix);
  // harmonia: Am7 · Fmaj7 · Cmaj7 · G6, 4 s cada
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]], BAS = [45, 41, 48, 43];
  for (let k = 0; k * 4 < DURATION; k++) {
    const t0 = k * 4, ch = CH[k % 4], len = Math.min(4, DURATION - t0);
    ch.forEach(n => [-6, 6].forEach(det => { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = N(n); o.detune.value = det;
      f.type = 'lowpass'; f.frequency.value = 900 + 500 * (t0 > 3); o.connect(f); f.connect(g); g.connect(mix); g.connect(dl);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.018, t0 + .6); g.gain.setValueAtTime(.018, t0 + len - .4); g.gain.linearRampToValueAtTime(0, t0 + len); o.start(t0); o.stop(t0 + len + .05); }));
    // baixo pulsando em colcheias (a partir da virada)
    for (let b = 0; b < 8 && t0 + b * .5 < IMPACTO; b++) if (t0 + b * .5 >= 3) osc('triangle', N(BAS[k % 4] - 12), t0 + b * .5, .35, .22);
    // arpejo leve
    for (let b = 0; b < 16 && t0 + b * .25 < IMPACTO - .1; b++) { const n = ch[(b * 3) % 4] + 12; osc('sine', N(n), t0 + b * .25, .18, t0 + b * .25 < 3 ? .03 : .045, .004, dl); }
  }
  // bateria: bumbo a cada batida (0,5 s) depois do gancho; chimbal no contratempo
  for (let t = 0; t < IMPACTO; t += BEAT) {
    if (t >= 3 || t === 0) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); o.connect(g); g.connect(mix); env(g, t, .003, t >= 3 ? .55 : .35, .25); o.start(t); o.stop(t + .3); }
    if (t >= 1) noise(t + .25, .05, t >= 3 ? .06 : .03, 'highpass', 7000, 9000);
    if (t >= SC[2] && Math.round(t / BEAT) % 4 === 2) noise(t, .14, .12, 'bandpass', 1800, 1200, .002, .8); // palma
  }
  // efeitos: whoosh nas transições, clique nas palavras, pop nos cartões, impacto na logo
  SC.slice(1, -1).forEach(b => { noise(b - .45, .55, .22, 'bandpass', 300, 5000, .4, 1.2); });
  noise(IMPACTO - .4, .5, .25, 'bandpass', 200, 6000, .4, 1);
  PAL.forEach(p => osc('sine', 2000 + (p.cena * 120), p.t0, .03, .02));
  HITS.forEach(tt => { const o = osc('sine', 520, tt - .05, .15, .12); o.frequency.exponentialRampToValueAtTime(1100, tt + .05); });
  CLIQUES.forEach(tt => { const o = osc('square', 300, tt, .2, .06); o.frequency.exponentialRampToValueAtTime(900, tt + .1); });
  { const tt = IMPACTO; const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(90, tt); o.frequency.exponentialRampToValueAtTime(30, tt + 1); o.connect(g); g.connect(mix); env(g, tt, .005, .7, 1.4); o.start(tt); o.stop(tt + 1.5);
    noise(tt, 2.2, .12, 'lowpass', 6000, 300, .005); [69, 72, 76, 81].forEach(n => osc('sine', N(n), tt + .05, 2.2, .05, .02, dl)); }
  const buf = await ac.startRendering();
  // WAV 16 bits estéreo em base64
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, out = new DataView(new ArrayBuffer(44 + n * 4));
  const ws = (o, s) => [...s].forEach((ch, i) => out.setUint8(o + i, ch.charCodeAt(0)));
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); ws(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, SR, true); out.setUint32(28, SR * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, clamp(L[i], -1, 1) * 32767, true); out.setInt16(46 + i * 4, clamp(R[i], -1, 1) * 32767, true); }
  const bytes = new Uint8Array(out.buffer); let s = ''; for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(s);
}
window.renderAudio = renderAudio;
// ícones extras (quadrado -100..100)
Object.assign(P, {
  calendario() { ctx.beginPath(); rr(-92, -80, 184, 170, 22); ctx.moveTo(-92, -30); ctx.lineTo(92, -30); ctx.moveTo(-50, -100); ctx.lineTo(-50, -60); ctx.moveTo(50, -100); ctx.lineTo(50, -60); },
  play() { ctx.beginPath(); rr(-100, -72, 200, 144, 30); ctx.moveTo(-26, -38); ctx.lineTo(42, 0); ctx.lineTo(-26, 38); ctx.closePath(); },
  legenda() { ctx.beginPath(); rr(-100, -72, 200, 144, 26); ctx.moveTo(-70, 20); ctx.lineTo(10, 20); ctx.moveTo(30, 20); ctx.lineTo(70, 20); ctx.moveTo(-70, 46); ctx.lineTo(40, 46); },
  sino() { ctx.beginPath(); ctx.moveTo(-70, 50); ctx.quadraticCurveTo(-60, 30, -60, -10); ctx.quadraticCurveTo(-60, -80, 0, -84); ctx.quadraticCurveTo(60, -80, 60, -10); ctx.quadraticCurveTo(60, 30, 70, 50); ctx.closePath(); ctx.moveTo(18, 64); ctx.arc(0, 64, 18, 0, Math.PI); },
  pessoa() { ctx.beginPath(); ctx.arc(0, -46, 40, 0, 7); ctx.moveTo(-76, 96); ctx.quadraticCurveTo(-76, 6, 0, 6); ctx.quadraticCurveTo(76, 6, 76, 96); ctx.closePath(); },
});
