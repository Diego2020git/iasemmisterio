// 14/10/2026 · Agente na Prática · agente de vendas que qualifica contatos (quente, morno, frio). Tempos em TEMPOS (voz.py).
const EP = '20';
const SC = TEMPOS.cenas, CAPS = TEMPOS.frases;
const HEAT = [['quente', 'QUENTE', COL.red], ['morno', 'MORNO', '#f2b84b'], ['frio', 'FRIO', COL.cyan]];
// pessoa em traço (cabeça + ombros)
function person(cx, cy, r, a, color = COL.ink) {
  if (a <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5;
  draw(a, 2 * Math.PI * r * 2.2, () => { ctx.beginPath(); ctx.arc(cx, cy - r * .5, r * .45, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + r * 1.05, r * .95, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); });
  ctx.restore();
}

// 0 · gancho: fila de contatos "só olhando"; o cubo do agente chega
CAMS[0] = () => [[0, 0, 30, 1.06, -1], [1, 0, 0, 1, 0], [cue('resolve') + .2, 0, 30, 1.03, .5]];
function s0(t, lt) {
  kinetic([{ w: 'Só', t: cue('só') }, { w: 'olhando?', t: cue('olhando') }], M, 230, lt, { size: 100, hl: [1] });
  for (let i = 0; i < 5; i++) person(M + 90 + i * 200, 620, 80, prog(lt, .3 + i * .15, .8 + i * .15), COL.dim);
  wire(Mesh.box(1, 1, 1), { x: W / 2, y: 1000, s: 220, rx: -.4, ry: lt * .9, d: 4 }, prog(lt, cue('agente') - .1, cue('agente') + .6), COL.cyan, 3);
  stamp(W / 2, 1260, 'agente de vendas', prog(lt, cue('vendas'), cue('vendas') + .35), 34);
}
// 1 · 3 perguntas aparecem uma a uma
CAMS[1] = () => [[0, 0, 0, 1, 0], [cue('investir'), 0, 40, 1.04, .4]];
function s1(t, lt) {
  title(['3 perguntas'], lt, .05, 200, 84, 0);
  fig('fig. 02 · conversa com cada contato', lt, .2, 320);
  [['precisa', 'O que você precisa?'], ['quando', 'Pra quando?'], ['investir', 'Quanto quer investir?']].forEach(([w, q], i) => {
    const a = prog(lt, cue(w) - .3, cue(w) + .3), y = 470 + i * 250;
    panel(M, y, W - 2 * M, 190, a, 'pergunta ' + (i + 1));
    txt(typed(q, a), M + 40, y + 115, ARC, 48, COL.ink, { weight: 600 });
  });
}
// 2 · a nota: termômetro com três faixas
CAMS[2] = () => [[0, 0, 0, 1, 0], [cue('frio'), 0, 40, 1.04, -.4]];
function s2(t, lt) {
  title(['A nota'], lt, .05, 200, 92, 0);
  fig('fig. 03 · cada contato recebe uma', lt, .2, 320);
  const x = W / 2 - 60, y0 = 450, h = 780;
  ctx.save(); ctx.globalAlpha = prog(lt, cue('nota') - .2, cue('nota') + .3); ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; rr(x, y0, 120, h, 60); ctx.stroke(); ctx.restore();
  HEAT.forEach(([w, l, c], i) => {
    const a = prog(lt, cue(w) - .1, cue(w) + .3), y = y0 + 40 + i * 250;
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(x + 20, y, 80, 200 * a); ctx.restore();
    txt(l, x + 170, y + 110, EXP, 64, c, { alpha: a });
  });
}
// 3 · o destino de cada nota: quente para você, morno lembrete em 2 dias, frio conteúdo
CAMS[3] = () => [[0, 0, 0, 1, 0], [cue('conteúdo'), 0, 40, 1.04, .4]];
function s3(t, lt) {
  title(['Destino'], lt, .05, 200, 92, 0);
  const rows = [[cue('quente'), 'QUENTE', COL.red, 'direto pra você + resumo'], [cue('morno'), 'MORNO', '#f2b84b', 'lembrete em 2 dias'], [cue('frio'), 'FRIO', COL.cyan, 'recebe conteúdo']];
  rows.forEach(([t0, l, c, d], i) => {
    const a = prog(lt, t0 - .1, t0 + .4), y = 440 + i * 280;
    if (a <= 0) return;
    txt(l, M, y + 70, EXP, 56, c, { alpha: a });
    draw(a, 400, () => { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(M + 330, y + 50); ctx.lineTo(M + 440, y + 50); ctx.stroke(); ctx.restore(); });
    panel(M + 470, y - 20, W - 2 * M - 470, 150, a);
    txt(typed(d, prog(a, .3, 1)), M + 500, y + 65, ARC, 34, COL.ink, { weight: 600 });
  });

}
// 4 · você só fala com quem está pronto; regras do agente
CAMS[4] = () => [[0, 0, 0, 1, 0], [cue('regras'), 0, 40, 1.04, -.4]];
function s4(t, lt) {
  kinetic([{ w: 'Pronto pra', t: cue('pronto') }, { w: 'comprar', t: cue('comprar') }], M, 230, lt, { size: 84, hl: [1], maxW: 1000 });
  person(W / 2, 640, 140, prog(lt, cue('fala') - .2, cue('fala') + .4), COL.cyan);
  for (let i = 0; i < 4; i++) person(M + 80 + i * 300, 640 + (i < 2 ? 0 : 0), 60, prog(lt, 0, .5) * (1 - prog(lt, cue('tempo'), cue('tempo') + .6)), COL.dim);
  panel(M, 900, W - 2 * M, 380, prog(lt, cue('define') - .2, cue('regras') + .3), 'regras · quem define é você');
  ['perguntas', 'notas'].forEach((w, i) => txt('→ ' + (i ? 'as notas' : 'as perguntas'), M + 40, 1000 + i * 100, ARC, 42, COL.ink, { weight: 600, alpha: prog(lt, cue(w) - .1, cue(w) + .3) }));
}
// 5 · fecha: três verbos e card final
CAMS[5] = () => [[0, 0, 30, 1.05, 0], [cue('separar'), 0, 0, 1, 0]];
function s5(t, lt) {
  kinetic([{ w: 'Perguntar,', t: cue('perguntar') }, { w: 'separar', t: cue('separar') }], M, 220, lt, { size: 56, maxW: 1000 });
  kinetic([{ w: 'e passar', t: cue('passar') }, { w: 'pra você', t: cue('você') }], M, 320, lt, { size: 56, hl: [1], maxW: 1000 });
  endCard(t, SC[5] + cue('salva') - .25);
}
