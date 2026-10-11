// 12/10/2026 · Faça com IA · qual IA usar pra cada tarefa (ChatGPT, Gemini, NotebookLM, Flow). Tempos em TEMPOS (voz.py).
const EP = '16';
const SC = TEMPOS.cenas, CAPS = TEMPOS.frases;
const TOOLS = [['ChatGPT', 'chatgpt.com', '#10a37f', 'TEXTO'], ['Gemini', 'gemini.google.com', '#4285f4', 'IMAGEM'], ['NotebookLM', 'notebooklm.google', '#4285f4', 'ESTUDO'], ['Flow', 'labs.google/flow', '#4285f4', 'VÍDEO']];
// ícone em traço de cada tarefa, desenhado dentro de um quadrado (k = índice da tarefa)
function taskIcon(k, cx, cy, r, p, color = COL.ink) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  if (k === 0) { ctx.translate(cx, cy); page(-r * .6, -r * .8, r * 1.2, r * 1.6, p); }
  if (k === 1) { draw(p, 8 * r, () => { ctx.strokeRect(cx - r * .8, cy - r * .6, r * 1.6, r * 1.2); ctx.beginPath(); ctx.moveTo(cx - r * .8, cy + r * .5); ctx.lineTo(cx - r * .2, cy - r * .1); ctx.lineTo(cx + r * .2, cy + r * .25); ctx.lineTo(cx + r * .5, cy - r * .05); ctx.lineTo(cx + r * .8, cy + r * .4); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + r * .4, cy - r * .3, r * .14, 0, 7); ctx.stroke(); }); }
  if (k === 2) { const o = { x: cx, y: cy, s: r * 1.6, rx: -.3, ry: .5, d: 4 }; wire(Mesh.box(.8, 1, .16), o, p, color, 3); }
  if (k === 3) strokeShape(morph(shape('rect', cx, cy, 0, { w: r * 1.6, h: r * 1.2 }), shape('play', cx + r * .1, cy, r * .7), prog(p, .5, 1)), { color, lw: 5, p: clamp(p * 2) });
  ctx.restore();
}

// 0 · gancho: uma "?" vira 4 quadrados, um por tarefa, e o carimbo "todas grátis"
CAMS[0] = () => [[0, 0, 30, 1.06, -1], [1, 0, 0, 1, 0], [cue('grátis') + .3, 0, 30, 1.03, .5]];
function s0(t, lt) {
  kinetic([{ w: 'Qual a', t: cue('qual') }, { w: 'melhor IA?', t: cue('melhor') }], M, 230, lt, { size: 100, hl: [1] });
  const split = prog(lt, cue('4') - .1, cue('4') + .6);
  if (split < 1) txt('?', W / 2, 820, EXP, 360, COL.cyan, { align: 'center', alpha: prog(lt, .2, .6) * (1 - split) });
  kinetic([{ w: 'depende', t: cue('depende') }, { w: 'da tarefa', t: cue('tarefa') }], M, 1150, lt, { size: 70, hl: [1] });
  TOOLS.forEach((tl, k) => {
    const x = k % 2 ? W / 2 + 20 : M, y = k < 2 ? 460 : 760, w = W / 2 - M - 20, h = 260, p = prog(split, k * .15, k * .15 + .5);
    panel(x, y, w, h, p, tl[3]);
    taskIcon(k, x + w / 2, y + h / 2, 80, p);
  });
  stamp(W / 2, 1360, 'todas com plano grátis', prog(lt, cue('grátis'), cue('grátis') + .35), 34);
}
// cena de ferramenta: título com a tarefa, ícone grande que reage à fala e selo da ferramenta
function toolScene(k, lt, w1, w2, extra) {
  stepTag(k + 1, 4, lt, 320);
  title([TOOLS[k][3]], lt, .05, 200, 92, 0);
  fig(`fig. 0${k + 2} · ferramenta da tarefa`, lt, .2, 320);
  const o = { x: W / 2, y: 720, s: 1 };
  taskIcon(k, W / 2, 700, 170, prog(lt, cue(w1) - .2, cue(w1) + .8), COL.ink);
  toolCard(W / 2, 1060, TOOLS[k][0], TOOLS[k][1] + ' · tem plano grátis', prog(lt, cue(w2) - .1, cue(w2) + .3), TOOLS[k][2]);
  extra && extra();
}
CAMS[1] = () => [[0, 0, 0, 1, 0], [cue('rascunho'), 0, 40, 1.04, .4]];
function s1(t, lt) {
  toolScene(0, lt, 'escrever', 'chatgpt', () => {
    const p = prog(lt, cue('explica') - .1, cue('rascunho') + .4);
    if (p > 0) promptBox(M, 1220, W - 2 * M, 'Escreve um post sobre a promoção de sábado.', p, t, 'você explica');
  });
}
CAMS[2] = () => [[0, 0, 0, 1, 0], [cue('desenha'), 0, 40, 1.04, -.4]];
function s2(t, lt) {
  toolScene(1, lt, 'imagem', 'gemini', () => {
    const d = prog(lt, cue('desenha') - .1, cue('desenha') + .8);
    if (d > 0) { ctx.save(); ctx.globalAlpha = d; ctx.fillStyle = 'rgba(46,230,255,.18)'; ctx.fillRect(W / 2 - 136, 700 - 102, 272 * d, 204); ctx.restore(); }
    dimLine(M, W - M, 1230, 'em segundos', prog(lt, cue('segundos'), cue('segundos') + .3));
  });
}
CAMS[3] = () => [[0, 0, 0, 1, 0], [cue('subiu'), 0, 40, 1.04, .4]];
function s3(t, lt) {
  toolScene(2, lt, 'estudar', 'notebooklm', () => {
    const a = prog(lt, cue('responde') - .1, cue('responde') + .4);
    annot(W / 2 + 120, 640, 900, 470, 'só o seu material', a, 'L', COL.cyan);
    dimLine(M, W - M, 1230, 'responde com a fonte', prog(lt, cue('subiu'), cue('subiu') + .3));
  });
}
CAMS[4] = () => [[0, 0, 0, 1, 0], [cue('gera'), 0, 40, 1.04, -.4]];
function s4(t, lt) {
  toolScene(3, lt, 'vídeo', 'flow', () => {
    const cam = prog(lt, cue('descreve') - .1, cue('descreve') + .6);
    wire(Mesh.camera(), { x: 820, y: 560, s: 160, rx: -.25, ry: -.6 + .5 * Math.sin(lt * 1.3), d: 4 }, cam, COL.cyan, 2.5);
    dimLine(M, W - M, 1230, 'do texto ao vídeo', prog(lt, cue('gera'), cue('gera') + .3));
  });
}
// 5 · fecha: os 4 quadrados voltam, cada um acende quando a tarefa é falada; card final
CAMS[5] = () => [[0, 0, 30, 1.05, 0], [cue('texto'), 0, 0, 1, 0]];
function s5(t, lt) {
  const ws = ['texto', 'imagem', 'estudo', 'vídeo'];
  TOOLS.forEach((tl, k) => {
    const x = k % 2 ? W / 2 + 20 : M, y = k < 2 ? 260 : 560, w = W / 2 - M - 20, h = 260, t0 = cue(ws[k]), p = prog(lt, t0 - .25, t0 + .3);
    panel(x, y, w, h, p, tl[3]);
    txt(tl[0], x + w / 2, y + h / 2, EXP, tl[0].length > 8 ? 40 : 52, lt > t0 ? COL.cyan : COL.ink, { align: 'center', alpha: p });
  });
  endCard(t, SC[5] + cue('salva') - .25);
}
