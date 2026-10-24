// Padrão de entrega (Diego, 24/10/2026: "atualize o sistema para criar com esse nível de entrega ou superior").
// Peças tiradas do extra PHP2Shell v3 (branch claude/project-thread-thpb2r), aprovado pelo Diego. Régua completa em
// /mnt/project-files/operacao/padrao-de-entrega.md. Carregar DEPOIS de neon-extra.js; já liga sozinho:
//   1) fundo com chão de grade em perspectiva + partículas subindo (cor da cena em COR[i]);
//   2) legenda grande palavra por palavra (EXP 66, caixa alta, palavra atual em ciano, y≈1480) por cima de tudo.
// Por isso o conteúdo da cena fica entre y 400 e 1300 e a fonte da notícia sai do rodapé (vai na legenda do post).
// Para desligar a legenda numa página: window.SEM_LEGENDA = true.
const VERM = '#ff4d6d', VERDE = '#3ddc84', AMB = '#ffc24b';
function flut(t, k = 0) { return 10 * Math.sin(t * 1.6 + k); } // flutuação leve

// ---------- legenda grande, palavra por palavra (blocos de até 3 palavras) ----------
let _BLOCOS = null;
function _blocos() { if (_BLOCOS) return _BLOCOS; _BLOCOS = []; let cur = [];
  for (const p of PAL) { if (cur.length && (cur[0].cena !== p.cena || cur.length === 3 || /[.,:?!]$/.test(cur[cur.length - 1].w))) { _BLOCOS.push(cur); cur = []; } cur.push(p); }
  if (cur.length) _BLOCOS.push(cur); return _BLOCOS; }
function legenda(t) {
  if (window.SEM_LEGENDA || t > PAL[PAL.length - 1].t1 + .3) return; const B = _blocos();
  const b = B.find((b, i) => t >= b[0].t0 - .05 && (i === B.length - 1 || t < B[i + 1][0].t0 - .05)); if (!b || t > b[b.length - 1].t1 + .6) return;
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
// ---------- título de cena: Archivo Expanded caixa alta, palavra-chave em destaque, largura máx. 840 ----------
function titulo(str, y, t0, t1, t, size = 96, cor = BR, hot = '', hotCor = CI) {
  const a = prog(t, t0, t0 + .25) * (1 - prog(t, t1, t1 + .3)); if (a <= 0) return; const e = back(prog(t, t0, t0 + .4));
  const w = measure(str, EXP, size), sc = Math.min(1, 840 / w);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx0, y); ctx.scale(sc * (.85 + .15 * e), sc * (.85 + .15 * e));
  ctx.shadowColor = hex(hotCor, .7); ctx.shadowBlur = 40; txt(str, 0, 0, EXP, size, cor, { align: 'center' });
  if (hot) { const hx = -w / 2 + measure(str.slice(0, str.indexOf(hot)), EXP, size); txt(hot, hx, 0, EXP, size, hotCor); }
  ctx.restore();
}
// ---------- etiqueta grande (versão, plano, preço); risco 0..1 risca em vermelho ----------
function versao(str, x, y, a, cor, risco = 0, size = 52) {
  if (a <= 0) return; const e = back(clamp(a)), w = measure(str, EXP, size) + 70;
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha *= clamp(a * 2);
  ctx.shadowColor = cor; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(8,16,34,.92)'; rr(-w / 2, -size, w, size * 2, size); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = cor; ctx.lineWidth = 4; rr(-w / 2, -size, w, size * 2, size); ctx.stroke();
  txt(str, 0, 3, EXP, size, BR, { align: 'center' });
  if (risco > 0) { ctx.strokeStyle = VERM; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 18, 0); ctx.lineTo(-w / 2 + 18 + (w - 36) * ease(risco), 0); ctx.stroke(); }
  ctx.restore();
}
// ---------- seta horizontal que cresce ----------
function setaH(x0, x1, y, a, cor = CI) {
  if (a <= 0) return; const x = lerp(x0, x1, ease(clamp(a)));
  ctx.save(); ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 24; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x - 10, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x - 26, y - 24); ctx.lineTo(x - 26, y + 24); ctx.closePath(); ctx.fill(); ctx.restore();
}
// ---------- pílula grande com subtítulo ----------
function pilula(str, x, y, w, a, cor, sub = '', on = 1, size = 40) {
  if (a <= 0) return; const e = back(clamp(a)), h = sub ? 120 : 96;
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha *= clamp(a * 2);
  ctx.shadowColor = cor; ctx.shadowBlur = 30 * on; ctx.fillStyle = 'rgba(8,16,34,.92)'; rr(-w / 2, -h / 2, w, h, 24); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = on ? cor : 'rgba(244,248,255,.25)'; ctx.lineWidth = 4; rr(-w / 2, -h / 2, w, h, 24); ctx.stroke();
  txt(str, 0, sub ? -18 : 2, ARC, size, BR, { align: 'center', weight: 600 });
  if (sub) txt(sub, 0, 30, ARC, 26, cor, { align: 'center', weight: 600, ls: 1 });
  ctx.restore();
}
// ---------- conexão que se desenha, com pulso correndo quando completa ----------
function fio(x0, y0, x1, y1, p, cor, t, pulso = true) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = hex(cor, .8); ctx.shadowColor = cor; ctx.shadowBlur = 16; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, ease(p)), lerp(y0, y1, ease(p))); ctx.stroke();
  if (pulso && p >= 1) { const q = (t * 1.2) % 1; ctx.fillStyle = BR; ctx.beginPath(); ctx.arc(lerp(x0, x1, q), lerp(y0, y1, q), 7, 0, 7); ctx.fill(); }
  ctx.restore();
}
// ---------- linha do tempo que se desenha: itens = [[rótulo, texto, t0, cor]] ----------
function linhaDoTempo(y, itens, t, a = 1) {
  if (a <= 0) return; const x0 = 140, x1 = W - 140, n = itens.length;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  itens.forEach(([rot, str, t0, cor], i) => { const x = n > 1 ? lerp(x0, x1, i / (n - 1)) : cx0, q = prog(t, t0 - .2, t0 + .2);
    if (i > 0) fio(lerp(x0, x1, (i - 1) / (n - 1)), y, x, y, prog(t, t0 - .5, t0), cor || CI, t, false);
    if (q <= 0) return; const c = cor || CI;
    ctx.save(); ctx.globalAlpha *= q; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(x, y, 18 * back(q), 0, 7); ctx.fill(); ctx.restore();
    txt(rot, x, y - 60, EXP, 40, c, { align: 'center', alpha: q }); txt(str, x, y + 64, ARC, 30, BR, { align: 'center', weight: 600, alpha: q }); });
  ctx.restore();
}
// ---------- formas extras ----------
Object.assign(P, {
  escudo() { ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(85, -65); ctx.quadraticCurveTo(85, 50, 0, 100); ctx.quadraticCurveTo(-85, 50, -85, -65); ctx.closePath(); },
  servidor() { ctx.beginPath(); for (let k = 0; k < 3; k++) { const y = -96 + k * 66; rr(-90, y, 180, 56, 12); ctx.moveTo(-50, y + 28); ctx.arc(-60, y + 28, 10, 0, 7); ctx.moveTo(10, y + 22); ctx.lineTo(70, y + 22); ctx.lineTo(70, y + 34); ctx.lineTo(10, y + 34); ctx.closePath(); } },
});
// ---------- fundo: chão de grade em perspectiva + partículas subindo ----------
{ const fundoBase = fundo;
  fundo = function (t, i, p) {
    fundoBase(t, i, p);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const hz = 1240, cor = (typeof COR !== 'undefined' && COR[i]) || AZ;
    for (let k = 0; k < 14; k++) { const z = ((k + (t * .6) % 1) / 14), y = hz + Math.pow(z, 2.2) * (H - hz);
      ctx.strokeStyle = hex(cor, .05 + .22 * z); ctx.lineWidth = 1 + 2 * z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let k = -12; k <= 12; k++) { ctx.strokeStyle = hex(cor, .12); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx0 + k * 30, hz); ctx.lineTo(cx0 + k * 260, H); ctx.stroke(); }
    for (let k = 0; k < 40; k++) { const s = (k * 9301 + 49297) % 233280 / 233280, s2 = (k * 7919) % 1000 / 1000;
      const y = H - ((t * (30 + 50 * s) + s2 * H) % H), x = s * W + 30 * Math.sin(t * .7 + k);
      ctx.fillStyle = hex(k % 3 ? CI : AZ, .25 + .3 * s2); ctx.beginPath(); ctx.arc(x, y, 1.5 + 2.5 * s, 0, 7); ctx.fill(); }
    ctx.restore();
  }; }
// ---------- legenda por cima de tudo, fora do zoom das cenas ----------
{ const renderBase = render; window.render = render = function (t) { renderBase(t); legenda(t); }; }
