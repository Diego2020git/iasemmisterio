// 15/10/2026 · Faça com IA · fórmula de planilha com o ChatGPT. Tempos em TEMPOS (voz.py).
const EP = '21';
const SC = TEMPOS.cenas, CAPS = TEMPOS.frases;
const ROWS = [['Bolo', '40', '3'], ['Torta', '55', '2'], ['Pão', '8', '12']];
// planilha em traço: colunas A a D, cabeçalho e 3 linhas; colA/D acendem; fill = quanto da coluna D já foi calculada
function sheet(x, y, a, hi = -1, fill = 0) {
  if (a <= 0) return;
  const cw = 220, ch = 90, cols = ['A', 'B', 'C', 'D'], head = ['produto', 'preço', 'qtd', 'total'];
  ctx.save(); ctx.globalAlpha = clamp(a * 1.5); ctx.lineWidth = 3;
  cols.forEach((c, i) => {
    const on = i === hi;
    txt(c, x + i * cw + cw / 2, y - 20, EXP, 34, on ? COL.cyan : COL.dim, { align: 'center' });
    for (let j = 0; j < 4; j++) {
      const p = prog(a, .2 + (i + j) * .05, .5 + (i + j) * .05);
      ctx.strokeStyle = on ? COL.cyan : COL.dim; ctx.globalAlpha = p; ctx.strokeRect(x + i * cw, y + j * ch, cw, ch);
      const v = j === 0 ? head[i] : i < 3 ? ROWS[j - 1][i] : (fill >= j / 3 ? String(ROWS[j - 1][1] * ROWS[j - 1][2]) : '');
      if (v) txt(v, x + i * cw + cw / 2, y + j * ch + 58, ARC, j === 0 ? 26 : 36, j === 0 ? COL.dim : (i === 3 ? COL.cyan : COL.ink), { align: 'center', weight: 600, alpha: p });
    }
  });
  ctx.restore();
}
const SX = (W - 880) / 2;

// 0 · gancho: fórmula vazia com "?" vira célula preenchida; selo do ChatGPT
CAMS[0] = () => [[0, 0, 30, 1.06, -1], [1, 0, 0, 1, 0], [cue('chatgpt') + .3, 0, 30, 1.03, .5]];
function s0(t, lt) {
  kinetic([{ w: 'Fórmula', t: cue('fórmula') }, { w: 'sem decorar', t: cue('escreve') }], M, 230, lt, { size: 84, hl: [1], maxW: 1000 });
  sheet(SX, 520, prog(lt, cue('planilha') - .2, cue('planilha') + .8), 3, prog(lt, cue('escreve'), cue('você') + .6));
  txt('=?', W / 2, 1060, EXP, 110, COL.cyan, { align: 'center', alpha: prog(lt, cue('sabe'), cue('sabe') + .3) * (1 - prog(lt, cue('escreve'), cue('escreve') + .3)) });
  toolCard(W / 2, 1150, 'ChatGPT', 'chatgpt.com · tem plano grátis', prog(lt, cue('chatgpt') - .1, cue('chatgpt') + .3), '#10a37f');
}
// 1 · passos 1 e 2: abre o ChatGPT; as colunas são explicadas
CAMS[1] = () => [[0, 0, 0, 1, 0], [cue('coluna'), 0, 40, 1.04, .4]];
function s1(t, lt) {
  stepTag(lt < cue('2') ? 1 : 2, 3, lt, 320);
  title(['Explica'], lt, .05, 200, 92, 0);
  toolCard(W / 2, 520, 'ChatGPT', 'chatgpt.com · tem plano grátis', prog(lt, cue('chatgpt') - .1, cue('chatgpt') + .3), '#10a37f');
  stamp(W / 2, 680, 'plano grátis', prog(lt, cue('grátis'), cue('grátis') + .3), 30);
  sheet(SX, 860, prog(lt, cue('coluna') - .3, cue('planilha') + .4));
}
// 2 · exemplo: cada coluna acende quando é falada; D pisca vazia
CAMS[2] = () => [[0, 0, 0, 1, 0], [cue('d') - .2, 40, 40, 1.05, -.4]];
function s2(t, lt) {
  title(['Exemplo'], lt, .05, 200, 92, 0);
  fig('fig. 03 · o que tem em cada coluna', lt, .2, 320);
  const hi = lt > cue('d') - .1 ? 3 : lt > cue('c') - .1 ? 2 : lt > cue('b') - .1 ? 1 : lt > cue('a') - .1 ? 0 : -1;
  sheet(SX, 520, prog(lt, 0, .8), hi);
  annot(SX + 3 * 220 + 110, 560, 700, 1100, 'total aqui', prog(lt, cue('total'), cue('total') + .4), 'L', COL.cyan);
}
// 3 · a fórmula chega digitada e a coluna D se preenche linha a linha
CAMS[3] = () => [[0, 0, 0, 1, 0], [cue('arrastar'), 0, 40, 1.04, .4]];
function s3(t, lt) {
  title(['A fórmula'], lt, .05, 200, 92, 0);
  const f = prog(lt, cue('pronta') - .1, cue('pronta') + 1.6);
  panel(M, 380, W - 2 * M, 180, prog(lt, cue('devolve') - .2, cue('devolve') + .3), 'célula D2');
  txt(typed('=B2*C2', f), M + 40, 500, EXP, 80, COL.cyan);
  sheet(SX, 720, prog(lt, 0, .6), 3, prog(lt, cue('arrastar') - .1, cue('baixo') + .6));
  const ar = prog(lt, cue('arrastar') - .1, cue('baixo') + .4);
  if (ar > 0) draw(ar, 300, () => { ctx.save(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 5; const x = SX + 4 * 220 + 30; ctx.beginPath(); ctx.moveTo(x, 830); ctx.lineTo(x, 1060); ctx.moveTo(x - 20, 1035); ctx.lineTo(x, 1060); ctx.lineTo(x + 20, 1035); ctx.stroke(); ctx.restore(); });
}
// 4 · passo 3: erro vira correção; Excel e Google Planilhas
CAMS[4] = () => [[0, 0, 0, 1, 0], [cue('excel'), 0, 40, 1.04, -.4]];
function s4(t, lt) {
  stepTag(3, 3, lt, 320);
  title(['Deu erro?'], lt, .05, 200, 92, 0);
  const e = prog(lt, cue('erro') - .2, cue('erro') + .3), c = prog(lt, cue('correção') - .1, cue('correção') + .4);
  panel(M, 450, W - 2 * M, 160, e, 'mensagem');
  txt('#VALOR!', M + 40, 555, EXP, 64, COL.red, { alpha: e * (1 - c) });
  txt('=B2*C2 ✓', M + 40, 555, EXP, 64, COL.cyan, { alpha: c });
  [['excel', 'Excel'], ['google', 'Google Planilhas']].forEach(([w, l], i) => { const a = prog(lt, cue(w) - .1, cue(w) + .3); panel(M + i * 470, 820, 430, 160, a); txt(l, M + i * 470 + 215, 915, ARC, 40, COL.ink, { align: 'center', weight: 600, alpha: a }); });
}
// 5 · fecha: prompt na legenda; card final
CAMS[5] = () => [[0, 0, 30, 1.05, 0], [cue('legenda'), 0, 0, 1, 0]];
function s5(t, lt) {
  kinetic([{ w: 'Prompt', t: cue('prompt') }, { w: 'na legenda', t: cue('legenda') }], M, 230, lt, { size: 80, hl: [1], maxW: 1000 });
  endCard(t, SC[5] + cue('salva') - .25);
}
