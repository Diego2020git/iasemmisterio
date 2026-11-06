// 15/10/2026 · Agente na Prática · agente financeiro: lê boletos, avisa e só paga com o seu sim. Tempos em TEMPOS (voz.py).
const EP = '22';
const SC = TEMPOS.cenas, CAPS = TEMPOS.frases;
// boleto em traço: retângulo com código de barras
function boleto(x, y, w, h, a, color = COL.ink, label = '') {
  if (a <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 4;
  draw(a, 2 * (w + h), () => ctx.strokeRect(x, y, w, h));
  ctx.globalAlpha = prog(a, .4, 1);
  for (let i = 0; i < 22; i++) { ctx.lineWidth = i % 3 ? 2 : 5; ctx.beginPath(); ctx.moveTo(x + 30 + i * (w - 60) / 22, y + h - 70); ctx.lineTo(x + 30 + i * (w - 60) / 22, y + h - 25); ctx.stroke(); }
  if (label) txt(label, x + 30, y + 55, ARC, 32, color, { weight: 600 });
  ctx.restore();
}

// 0 · gancho: boleto com carimbo "vencido"; cadeado "sem aprovação, não paga"
CAMS[0] = () => [[0, 0, 30, 1.06, -1], [1, 0, 0, 1, 0], [cue('aprovação') + .2, 0, 30, 1.03, .5]];
function s0(t, lt) {
  kinetic([{ w: 'Boleto', t: cue('boleto') }, { w: 'vencido?', t: cue('vencido') }], M, 230, lt, { size: 100, hl: [1] });
  boleto(M + 80, 480, W - 2 * M - 160, 300, prog(lt, cue('boleto') - .1, cue('boleto') + .6), COL.ink, 'Conta de luz · R$ 230');
  stamp(W / 2, 640, 'vencido', prog(lt, cue('vencido'), cue('vencido') + .3), 40);
  wire(Mesh.box(1, 1, 1), { x: W / 2, y: 1020, s: 180, rx: -.4, ry: lt * .9, d: 4 }, prog(lt, cue('agente') - .1, cue('agente') + .6), COL.cyan, 3);
  txt('SÓ COM A SUA APROVAÇÃO', W / 2, 1250, ARC, 32, COL.cyan, { align: 'center', weight: 600, ls: 4, alpha: prog(lt, cue('aprovação') - .2, cue('aprovação') + .3) });
}
// 1 · o e-mail chega, o boleto sai do envelope e vira linha da planilha
CAMS[1] = () => [[0, 0, 0, 1, 0], [cue('planilha'), 0, 40, 1.04, .4]];
function s1(t, lt) {
  title(['Lê e anota'], lt, .05, 200, 88, 0);
  fig('fig. 02 · do e-mail pra planilha', lt, .2, 320);
  envelope(W / 2 - 120, 420, 240, 160, prog(lt, cue('e-mail') - .4, cue('e-mail') + .3));
  panel(M, 700, W - 2 * M, 460, prog(lt, cue('anota') - .2, cue('anota') + .4), 'planilha de contas');
  [['valor', 'VALOR', 'R$ 230'], ['vencimento', 'VENCE', '20/10'], ['fornecedor', 'FORNECEDOR', 'Luz']].forEach(([w, l, v], i) => {
    const a = prog(lt, cue(w) - .15, cue(w) + .4), x = M + 40 + i * 320;
    txt(l, x, 800, ARC, 24, COL.cyan, { weight: 600, ls: 3, alpha: a });
    txt(typed(v, a), x, 880, EXP, 52, COL.ink);
  });
}
// 2 · aviso 3 dias antes: calendário com contagem regressiva
CAMS[2] = () => [[0, 0, 0, 1, 0], [cue('link'), 0, 40, 1.04, -.4]];
function s2(t, lt) {
  title(['Avisa antes'], lt, .05, 200, 88, 0);
  const c = prog(lt, cue('3') - .1, cue('vencer') + .6);
  odometer(3 * easeInOut(c), 1, W / 2 - 60, 640, 220);
  txt('dias antes', W / 2, 760, ARC, 40, COL.dim, { align: 'center', weight: 600, alpha: c });
  panel(M, 900, W - 2 * M, 280, prog(lt, cue('avisa') - .2, cue('avisa') + .4), 'aviso');
  txt(typed('Luz vence 20/10: R$ 230', prog(lt, cue('valor') - .2, cue('valor') + .6)), M + 40, 1010, ARC, 42, COL.ink, { weight: 600 });
  txt(typed('Link do boleto →', prog(lt, cue('link') - .1, cue('link') + .4)), M + 40, 1100, ARC, 38, COL.cyan, { weight: 600 });
}
// 3 · "pode pagar": a trava abre só com a resposta
CAMS[3] = () => [[0, 0, 0, 1, 0], [cue('mexe'), 0, 40, 1.04, .4]];
function s3(t, lt) {
  title(['Seu sim'], lt, .05, 200, 92, 0);
  fig('fig. 04 · sem resposta, nada acontece', lt, .2, 320);
  panel(W - M - 520, 450, 520, 130, prog(lt, cue('responde') - .2, cue('pagar') + .2), 'você');
  txt('Pode pagar.', W - M - 490, 535, ARC, 44, COL.cyan, { weight: 600, alpha: prog(lt, cue('pode'), cue('pagar') + .2) });
  const op = easeInOut(prog(lt, cue('agenda') - .1, cue('agenda') + .5));
  ctx.save(); ctx.strokeStyle = op > .5 ? COL.cyan : COL.ink; ctx.lineWidth = 6; ctx.globalAlpha = prog(lt, .2, .6);
  ctx.strokeRect(W / 2 - 110, 820, 220, 180);
  ctx.beginPath(); ctx.arc(W / 2, 820, 75, Math.PI, Math.PI * 2 - op * .9); ctx.stroke(); ctx.restore();
  stamp(W / 2, 1150, 'pagamento agendado', prog(lt, cue('pagamento'), cue('pagamento') + .35), 32);
}
// 4 · resumo do mês: barras entra x sai x vence; regras definidas por você
CAMS[4] = () => [[0, 0, 0, 1, 0], [cue('regras'), 0, 40, 1.04, -.4]];
function s4(t, lt) {
  title(['Resumo do mês'], lt, .05, 200, 70, 0);
  [['entrou', 'ENTROU', 420, COL.cyan], ['saiu', 'SAIU', 290, COL.ink], ['vence', 'VENCE', 150, '#f2b84b']].forEach(([w, l, h, c], i) => {
    const a = prog(lt, cue(w) - .1, cue(w) + .5), x = M + 60 + i * 300, base = 940;
    ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.strokeRect(x, base - h * easeInOut(a), 180, h * easeInOut(a)); ctx.restore();
    txt(l, x + 90, base + 50, ARC, 28, c, { align: 'center', weight: 600, ls: 3, alpha: a });
  });
  panel(M, 1070, W - 2 * M, 200, prog(lt, cue('limites') - .2, cue('regras') + .3), 'regras · quem define é você');
  txt('→ limite de valor, quem aprova', M + 40, 1180, ARC, 38, COL.ink, { weight: 600, alpha: prog(lt, cue('define'), cue('define') + .4) });
}
// 5 · fecha: quatro verbos e card final
CAMS[5] = () => [[0, 0, 30, 1.05, 0], [cue('avisar'), 0, 0, 1, 0]];
function s5(t, lt) {
  kinetic([{ w: 'Ler, anotar,', t: cue('ler') }, { w: 'avisar', t: cue('avisar') }], M, 220, lt, { size: 60, maxW: 1000 });
  kinetic([{ w: 'e esperar', t: cue('esperar') }, { w: 'o seu sim', t: cue('sim') }], M, 320, lt, { size: 60, hl: [1], maxW: 1000 });
  endCard(t, SC[5] + cue('salva') - .25);
}
