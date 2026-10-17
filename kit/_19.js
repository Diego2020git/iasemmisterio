// 14/10/2026 · Faça com IA · logo do seu negócio com o Gemini, de graça. Tempos em TEMPOS (voz.py).
const EP = '19';
const SC = TEMPOS.cenas, CAPS = TEMPOS.frases;
// logo de exemplo em traço: casinha (Doce Lar) com um cupcake no lugar da porta; v = variação (0 completo, 1 só símbolo)
function logoDraft(cx, cy, s, a, color = COL.ink, v = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  draw(a, 9 * s, () => {
    ctx.beginPath(); ctx.moveTo(cx - s * .8, cy - s * .1); ctx.lineTo(cx, cy - s * .8); ctx.lineTo(cx + s * .8, cy - s * .1); ctx.stroke();
    ctx.strokeRect(cx - s * .6, cy - s * .1, s * 1.2, s * .9);
    ctx.beginPath(); ctx.arc(cx, cy + s * .25, s * .22, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * .22, cy + s * .25); ctx.lineTo(cx - s * .15, cy + s * .6); ctx.lineTo(cx + s * .15, cy + s * .6); ctx.lineTo(cx + s * .22, cy + s * .25); ctx.stroke();
  });
  ctx.restore();
  if (!v) txt('DOCE LAR', cx, cy + s * 1.2, EXP, s * .38, color, { align: 'center', alpha: prog(a, .6, 1) });
}

// 0 · gancho: logo se desenha sozinho; carimbo "de graça"; selo do Gemini
CAMS[0] = () => [[0, 0, 30, 1.06, -1], [1, 0, 0, 1, 0], [cue('google') + .3, 0, 30, 1.03, .5]];
function s0(t, lt) {
  kinetic([{ w: 'Seu logo', t: cue('logo') }, { w: 'com IA', t: cue('ia') }], M, 230, lt, { size: 100, hl: [1] });
  panel(M + 120, 470, W - 2 * M - 240, 520, prog(lt, cue('logo') - .1, cue('logo') + .5), 'esboço');
  logoDraft(W / 2, 660, 200, prog(lt, cue('negócio') - .2, cue('graça') + .8), COL.cyan);
  stamp(W / 2, 1060, 'de graça', prog(lt, cue('graça'), cue('graça') + .35), 40);
  toolCard(W / 2, 1230, 'Gemini', 'gemini.google.com · tem plano grátis', prog(lt, cue('gemini') - .1, cue('gemini') + .3), '#4285f4');
}
// 1 · passo 1: entra com a conta Google; contador de imagens do dia
CAMS[1] = () => [[0, 0, 0, 1, 0], [cue('limite'), 0, 40, 1.04, .4]];
function s1(t, lt) {
  stepTag(1, 3, lt, 320);
  title(['Entra'], lt, .05, 200, 92, 0);
  toolCard(W / 2, 560, 'Gemini', 'gemini.google.com · tem plano grátis', prog(lt, cue('gemini') - .1, cue('gemini') + .3), '#4285f4');
  panel(M + 80, 720, W - 2 * M - 160, 120, prog(lt, cue('conta') - .2, cue('google') + .3), 'conta google');
  txt(typed('voce@gmail.com', prog(lt, cue('conta'), cue('google') + .4)), M + 120, 790, ARC, 40, COL.ink, { weight: 600 });
  const g = prog(lt, cue('imagens') - .1, cue('imagens') + .5);
  for (let i = 0; i < 5; i++) { const a = prog(g, i * .15, i * .15 + .4); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.strokeRect(M + 40 + i * 190, 960, 160, 160); ctx.restore(); } }
  dimLine(M, W - M, 1220, 'limite por dia', prog(lt, cue('limite'), cue('dia') + .3));
}
// 2 · passo 2: as 4 informações viram campos do pedido
CAMS[2] = () => [[0, 0, 0, 1, 0], [cue('cores'), 0, 40, 1.04, -.4]];
function s2(t, lt) {
  stepTag(2, 3, lt, 320);
  title(['4 informações'], lt, .05, 200, 80, 0);
  [['nome', 'NOME'], ['ramo', 'RAMO'], ['estilo', 'ESTILO'], ['cores', 'CORES']].forEach(([w, l], i) => {
    const x = i % 2 ? W / 2 + 20 : M, y = i < 2 ? 470 : 800, a = prog(lt, cue(w) - .15, cue(w) + .4);
    panel(x, y, W / 2 - M - 20, 260, a, 'campo ' + (i + 1));
    txt(l, x + (W / 2 - M - 20) / 2, y + 140, EXP, 56, lt > cue(w) ? COL.cyan : COL.ink, { align: 'center', alpha: a });
  });
}
// 3 · exemplo: o pedido é digitado e o logo aparece ao lado das cores
CAMS[3] = () => [[0, 0, 0, 1, 0], [cue('branco'), 0, 40, 1.04, .4]];
function s3(t, lt) {
  title(['Exemplo'], lt, .05, 200, 92, 0);
  fig('fig. 04 · o pedido', lt, .2, 320);
  promptBox(M, 420, W - 2 * M, 'Cria um logo pra Doce Lar, uma confeitaria. Estilo minimalista, rosa e marrom, fundo branco.', prog(lt, cue('doce') - .3, cue('branco') + .4), t, 'você pede');
  logoDraft(W / 2, 960, 170, prog(lt, cue('minimalista') - .1, cue('branco') + .6), COL.ink);
  [['rosa', '#e88aa8'], ['marrom', '#8a5a3c']].forEach(([w, c], i) => { const a = prog(lt, cue(w) - .1, cue(w) + .3); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(W - M - 60, 860 + i * 120, 40, 0, 7); ctx.fill(); ctx.restore(); } });
}
// 4 · passo 3: ajuste; o logo completo se transforma só no símbolo e troca de cor
CAMS[4] = () => [[0, 0, 0, 1, 0], [cue('símbolo'), 0, 40, 1.05, -.4]];
function s4(t, lt) {
  stepTag(3, 3, lt, 320);
  title(['Ajusta'], lt, .05, 200, 92, 0);
  const sym = prog(lt, cue('símbolo') - .1, cue('símbolo') + .4), cor = prog(lt, cue('cor') - .1, cue('cor') + .4);
  logoDraft(W / 2, 760, 200 + 60 * easeInOut(sym), prog(lt, 0, .6), cor > .5 ? COL.cyan : COL.ink, sym > .5 ? 1 : 0);
  [['simples', 'mais simples'], ['símbolo', 'só o símbolo'], ['cor', 'outra cor']].forEach(([w, l], i) => {
    const a = prog(lt, cue(w) - .1, cue(w) + .35);
    txt('→ ' + l, M + 20, 1160 + i * 80, ARC, 40, lt > cue(w) ? COL.cyan : COL.ink, { weight: 600, alpha: a });
  });
}
// 5 · fecha: prompt na legenda; card final
CAMS[5] = () => [[0, 0, 30, 1.05, 0], [cue('legenda'), 0, 0, 1, 0]];
function s5(t, lt) {
  kinetic([{ w: 'Prompt', t: cue('prompt') }, { w: 'na legenda', t: cue('legenda') }], M, 230, lt, { size: 80, hl: [1], maxW: 1000 });
  endCard(t, SC[5] + cue('salva') - .25);
}
