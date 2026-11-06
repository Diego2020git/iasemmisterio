// Render quadro a quadro de um vídeo Raio-X, sem dependências (Chromium headless + DevTools Protocol + ffmpeg).
// Uso: node render.mjs pagina.html saida.mp4 [audio.wav]      -> MP4 30 fps com a narração
//      node render.mjs pagina.html pasta/ stills t1,t2,...    -> JPGs nos instantes pedidos
//      node render.mjs pagina.html trilha.wav audio           -> WAV da trilha feita em Web Audio (renderAudio() da página)
// Cada quadro chama render(i/30) na página e copia o canvas; nada depende do relógio real.
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import * as fs from 'node:fs';
import { writeFileSync, mkdirSync } from 'node:fs';

// Chrome: CHROME do ambiente, senão o primeiro que existir em /opt/pw-browsers (a versão muda entre ambientes).
const CHROME = process.env.CHROME || (() => { const base = '/opt/pw-browsers';
  const cands = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'];
  try { for (const d of fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()) cands.push(`${base}/${d}/chrome-linux64/chrome`, `${base}/${d}/chrome-linux/chrome`); } catch {}
  return cands.find(c => fs.existsSync(c)) || cands[0]; })();
const [html, out, a3, a4] = process.argv.slice(2);
const FPS = 30, PORT = 9300 + Math.floor(Math.random() * 500);

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--allow-file-access-from-files', '--no-sandbox',
  '--disable-gpu', '--hide-scrollbars', '--window-size=1080,1920', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch { await sleep(250); }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map(); let loaded;
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Page.loadEventFired' && loaded) loaded();
});
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || JSON.stringify(r.result.exceptionDetails));
  return r.result.result.value;
}
await send('Page.enable'); await send('Runtime.enable');
await new Promise(r => { loaded = r; send('Page.navigate', { url: 'file://' + resolve(html) }); });
await ev('Promise.all([...document.fonts].map(f => f.load())).then(() => document.fonts.ready).then(() => 1)');
const frame = async (t, q = .92) => Buffer.from((await ev(`(render(${t}), document.getElementById('c').toDataURL('image/jpeg', ${q}))`)).split(',')[1], 'base64');

if (a3 === 'audio') {
  writeFileSync(out, Buffer.from(await ev('renderAudio()'), 'base64'));
} else if (a3 === 'stills') {
  mkdirSync(out, { recursive: true });
  for (const t of a4.split(',').map(Number)) writeFileSync(`${out}/still_${t.toFixed(2).padStart(5, '0')}.jpg`, await frame(t, .85));
} else {
  const dur = await ev('DURATION'); const n = Math.round(dur * FPS);
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (a3) args.push('-i', a3, '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    const buf = await frame(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) process.stdout.write(`quadro ${i}/${n}\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`${out}: ${n} quadros, ${dur.toFixed(2)} s`);
}
ws.close(); chrome.kill();
