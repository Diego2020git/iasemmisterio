// Peças extras do kit neon para a grade de 19/10 (Radar IA e séries). Carregar depois de neon-kit.js.
Object.assign(P, {
  envelope() { ctx.beginPath(); rr(-100, -70, 200, 140, 18); ctx.moveTo(-92, -60); ctx.lineTo(0, 12); ctx.lineTo(92, -60); },
  pasta() { ctx.beginPath(); ctx.moveTo(-100, -60); ctx.lineTo(-40, -60); ctx.lineTo(-20, -80); ctx.lineTo(100, -80); ctx.lineTo(100, 80); ctx.lineTo(-100, 80); ctx.closePath(); ctx.moveTo(-100, -30); ctx.lineTo(100, -30); },
  radar() { ctx.beginPath(); ctx.arc(0, 0, 98, 0, 7); ctx.moveTo(62, 0); ctx.arc(0, 0, 62, 0, 7); ctx.moveTo(26, 0); ctx.arc(0, 0, 26, 0, 7); ctx.moveTo(0, 0); ctx.lineTo(70, -70); },
  cadeado() { ctx.beginPath(); rr(-80, -20, 160, 120, 20); ctx.moveTo(-50, -20); ctx.lineTo(-50, -50); ctx.arc(0, -50, 50, Math.PI, 0); ctx.lineTo(50, -20); ctx.moveTo(12, 40); ctx.arc(0, 40, 12, 0, 7); },
  raio() { ctx.beginPath(); ctx.moveTo(20, -100); ctx.lineTo(-60, 15); ctx.lineTo(-5, 15); ctx.lineTo(-25, 100); ctx.lineTo(60, -20); ctx.lineTo(5, -20); ctx.closePath(); },
});
// número grande do passo/notícia
function numero(n, y, t0, t1, t) {
  const a = prog(t, t0, t0 + .3) * (1 - prog(t, t1, t1 + .3)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; const e = back(clamp(prog(t, t0, t0 + .45)));
  ctx.translate(cx0, y); ctx.scale(e, e); ctx.shadowColor = CI; ctx.shadowBlur = 50;
  txt(String(n), 0, 0, EXP, 150, CI, { align: 'center' }); ctx.restore();
}
// janela de app (fundo claro), devolve a área interna
function janela(top, h, a, titulo, conteudo, w = 820) {
  if (a <= 0) return; const x = cx0 - w / 2, e = .9 + .1 * back(clamp(a));
  ctx.save(); ctx.globalAlpha *= clamp(a * 1.5); ctx.translate(cx0, top + h / 2); ctx.scale(e, e); ctx.translate(-cx0, -top - h / 2);
  ctx.shadowColor = hex(AZ, .6); ctx.shadowBlur = 60; ctx.fillStyle = '#f4f7ff'; rr(x, top, w, h, 26); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#e1e8f8'; rr(x, top, w, 70, 26); ctx.fill(); ctx.fillRect(x, top + 40, w, 30);
  ['#ff6b6b', '#ffc24b', '#3ddc84'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 40 + i * 30, top + 35, 9, 0, 7); ctx.fill(); });
  txt(titulo, cx0, top + 36, ARC, 28, '#5a6a8f', { align: 'center', weight: 600 });
  conteudo(x + 40, top + 110, w - 80); ctx.restore();
}
// campo de configuração: rótulo pequeno + caixa com valor
function campo(x, y, w, rot, valor, a, ativo = 0) {
  if (a <= 0) return 0; ctx.save(); ctx.globalAlpha *= clamp(a * 2); const dx = 30 * (1 - ease(clamp(a)));
  txt(rot.toUpperCase(), x + dx, y, ARC, 22, '#5a6a8f', { weight: 600, ls: 2 });
  ctx.fillStyle = ativo > 0 ? '#dbe6ff' : '#ffffff'; rr(x + dx, y + 20, w, 74, 14); ctx.fill();
  ctx.strokeStyle = ativo > 0 ? AZ : '#c5d0e6'; ctx.lineWidth = ativo > 0 ? 4 : 2; rr(x + dx, y + 20, w, 74, 14); ctx.stroke();
  txt(valor, x + dx + 24, y + 58, ARC, 36, '#1b2440', { weight: 600 }); ctx.restore(); return 130;
}
function botao(x, y, str, a, press = 0, cor = AZ) {
  if (a <= 0) return; const w = measure(str, ARC, 38, 600) + 70, s = 1 - .08 * Math.sin(clamp(press) * Math.PI);
  ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.translate(x + w / 2, y + 40); ctx.scale(s, s);
  ctx.shadowColor = cor; ctx.shadowBlur = 25 * clamp(press * 3); ctx.fillStyle = cor; rr(-w / 2, -40, w, 80, 40); ctx.fill(); ctx.shadowBlur = 0;
  txt(str, 0, 2, ARC, 38, '#ffffff', { align: 'center', weight: 600 }); ctx.restore();
}
// linha de texto simples, centralizada, com entrada suave
function linhaTxt(str, y, t0, t1, t, size = 44, cor = BR) {
  const a = prog(t, t0, t0 + .3) * (1 - prog(t, t1, t1 + .3)); if (a <= 0) return;
  txt(str, cx0, y + 20 * (1 - ease(prog(t, t0, t0 + .3))), ARC, size, cor, { align: 'center', weight: 600, alpha: a });
}
