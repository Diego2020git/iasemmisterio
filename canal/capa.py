"""Gera a capa do vídeo: o último quadro da cena 0 (título inteiro e desenho pronto, antes da primeira troca de cena).

Uso: python3 canal/capa.py canal/roteiros/X.json   grava videos/<nome>-capa.jpg ao lado do MP4
O publicar.py usa o mesmo instante como capa do Instagram no Buffer (thumbnailOffset).
"""
import json, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def caminho_capa(video):
    return str(Path(video).with_name(Path(video).stem + "-capa.jpg"))


def instante_capa(r):
    """Segundos do quadro da capa: logo antes da primeira troca de cena."""
    slug = Path(r["video"]).stem.replace("-raiox-final", "").replace("-raiox", "")
    tempos = json.load(open(RAIZ / "kit" / "audio" / f"{slug}.tempos.json"))
    return max(.5, tempos["cenas"][1] - .3)


def gerar(roteiro):
    r = json.load(open(roteiro))
    video = RAIZ / r["video"]
    t = instante_capa(r)
    saida = RAIZ / caminho_capa(r["video"])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1", "-q:v", "3", str(saida)], check=True)
    print(f"capa {saida.relative_to(RAIZ)} ({t:.1f} s)")


if __name__ == "__main__":
    for a in sys.argv[1:]:
        gerar(a)
