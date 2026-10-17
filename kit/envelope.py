"""Envelope do áudio a 30 quadros/s para a boca do personagem.

uso: python3 kit/envelope.py kit/audio/<slug>.wav kit/personagem/<tema>.env.js
Gera `const ENV=[...]`: um valor de 0 a 1 por quadro (RMS normalizado pelo percentil 95).
"""
import array, json, sys, wave


def envelope(caminho, fps=30):
    with wave.open(caminho) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        amostras = array.array("h", w.readframes(w.getnframes()))
    if ch > 1:
        amostras = amostras[::ch]
    passo = sr // fps
    rms = []
    for i in range(0, len(amostras), passo):
        bloco = amostras[i:i + passo]
        rms.append((sum(v * v for v in bloco) / max(1, len(bloco))) ** .5)
    teto = sorted(rms)[int(len(rms) * .95)] or 1
    return [round(min(1.0, v / teto), 3) for v in rms]


if __name__ == "__main__":
    env = envelope(sys.argv[1])
    open(sys.argv[2], "w").write("const ENV=" + json.dumps(env) + ";\n")
    print(f"{sys.argv[2]}: {len(env)} quadros")
