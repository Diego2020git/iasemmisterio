"""Gera a narração de um roteiro (canal/roteiros/*.json) e o mapa de tempo por palavra.

Uso: python3 voz.py roteiro.json saida_sem_extensao [voz]
Saídas: saida.wav (24 kHz mono, loudnorm -14 LUFS), saida.tempos.json e saida.tempos.js (para o HTML do vídeo).
Voz por cena (Google Cloud TTS, Chirp 3 HD, velocidade 1,06). Dentro da cena, as pausas reais do áudio
separam as frases, e cada palavra recebe um trecho proporcional às sílabas dela. A animação usa esses tempos.
"""
import os, sys, json, base64, re, wave, subprocess, tempfile, urllib.request
import numpy as np

SR, RATE, GAP = 24000, 1.06, 0.22  # GAP: silêncio entre cenas (s)
VOGAIS = re.compile(r'[aeiouáéíóúâêôãõàü]+', re.I)

def tts(texto, voz):
    body = {"input": {"text": texto}, "voice": {"languageCode": "pt-BR", "name": voz},
            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": SR, "speakingRate": RATE}}
    req = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "X-Goog-Api-Key": os.environ["GOOGLE_API_KEY"]})
    wav = base64.b64decode(json.load(urllib.request.urlopen(req, timeout=90))["audioContent"])
    with tempfile.NamedTemporaryFile(suffix='.wav') as f:
        f.write(wav); f.flush(); w = wave.open(f.name)
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

def trechos_com_voz(x):
    """Lista de (início, fim) em segundos com voz, separados por pausas de 0,1 s ou mais."""
    hop = SR // 100; n = len(x) // hop
    rms = np.array([np.sqrt((x[i*hop:(i+1)*hop] ** 2).mean()) for i in range(n)])
    on = rms > max(rms.max() * 0.04, 1e-3)
    segs, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]: j += 1
            segs.append([i / 100, j / 100]); i = j
        else: i += 1
    out = [segs[0]]
    for s in segs[1:]:
        if s[0] - out[-1][1] < 0.10: out[-1][1] = s[1]
        else: out.append(s)
    return out

def silabas(p): return max(1, len(VOGAIS.findall(p)))

def palavras_no_tempo(fala, legenda, t0, t1):
    fw, lw = fala.split(), legenda.split()
    pesos = np.array([silabas(w) + (0.6 if w[-1] in ',.:;?!' else 0) for w in fw], float)
    bordas = t0 + (t1 - t0) * np.concatenate([[0], np.cumsum(pesos) / pesos.sum()])
    if len(fw) == len(lw):
        return [{"w": w, "t0": round(bordas[i], 3), "t1": round(bordas[i+1], 3)} for i, w in enumerate(lw)]
    # legenda com outra contagem (ex.: "cinquenta" -> "50"): reparte pela posição relativa
    tl = lambda f: float(np.interp(f, np.linspace(0, 1, len(bordas)), bordas))
    return [{"w": w, "t0": round(tl(i / len(lw)), 3), "t1": round(tl((i + 1) / len(lw)), 3)} for i, w in enumerate(lw)]

def main(rot, saida, voz="pt-BR-Chirp3-HD-Fenrir"):
    r = json.load(open(rot)); audio, t = [], 0.0
    cenas, frases, palavras = [], [], []
    for ci, c in enumerate(r["cenas"]):
        x = tts(" ".join(f["fala"] for f in c["frases"]), voz)
        segs = trechos_com_voz(x)
        a, b = segs[0][0], segs[-1][1]
        x = x[max(0, int((a - .04) * SR)):int((b + .12) * SR)]; off = a - .04
        segs = [[s[0] - off, s[1] - off] for s in segs]
        n = len(c["frases"])
        # cada fim de frase vai para a pausa real mais perto de onde as sílabas dizem que ele cai
        sil = np.cumsum([sum(silabas(w) for w in f["fala"].split()) for f in c["frases"]]); sil = sil / sil[-1]
        cortes, livre = [], list(range(len(segs) - 1))
        for fr in sil[:-1]:
            alvo = segs[0][0] + fr * (segs[-1][1] - segs[0][0])
            k = min(livre, key=lambda k: abs((segs[k][1] + segs[k+1][0]) / 2 - alvo) - 0.8 * (segs[k+1][0] - segs[k][1]))
            cortes.append(k); livre = [j for j in livre if j > k]
        lim = [segs[0][0]]
        for k in cortes: lim += [segs[k][1], segs[k+1][0]]
        lim.append(segs[-1][1])
        cenas.append(round(t, 3))
        for fi, f in enumerate(c["frases"]):
            f0, f1 = t + lim[2*fi], t + lim[2*fi+1]
            frases.append([round(f0, 3), round(f1, 3), f["legenda"]])
            for p in palavras_no_tempo(f["fala"], f["legenda"], f0, f1): p["cena"] = ci; palavras.append(p)
        audio.append(x); t += len(x) / SR
        if ci < len(r["cenas"]) - 1: audio.append(np.zeros(int(GAP * SR), np.float32)); t += GAP
    cenas.append(round(t + .9, 3))  # fim: deixa o card final respirar
    bruto = saida + ".bruto.wav"
    with wave.open(bruto, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(np.concatenate(audio + [np.zeros(int(.9 * SR), np.float32)]), -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", bruto, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "1", saida + ".wav"], check=True)
    os.remove(bruto)
    caracteres = sum(len(f["fala"]) for c in r["cenas"] for f in c["frases"])
    json.dump({"voz": voz, "caracteres": caracteres, "duracao": cenas[-1], "cenas": cenas, "frases": frases, "palavras": palavras},
              open(saida + ".tempos.json", "w"), ensure_ascii=False, indent=1)
    open(saida + ".tempos.js", "w").write("window.TEMPOS = " + open(saida + ".tempos.json").read() + ";\n")
    print(f"{saida}.wav  {cenas[-1]:.2f}s  {caracteres} caracteres  cenas={cenas}")

if __name__ == "__main__": main(*sys.argv[1:])
