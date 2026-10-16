"""Validador que barra. Nenhum vídeo é agendado sem passar por aqui.

Uso: python3 canal/validar.py canal/roteiros/AAAA-MM-DD-serie.json [--sem-mp4]
Sai com código 1 e lista os motivos quando barra. --sem-mp4 pula a checagem da duração real
(para validar o roteiro antes de gerar voz e vídeo).
Regras: canal/rotina.md e /mnt/project-files/operacao/prompt-operacao-v2.md (item 4).
"""
import json, re, subprocess, sys, unicodedata
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CANAL = RAIZ / "canal"

# Grade aprovada pelo Diego em 11/10/2026: todos os dias, uma série por horário.
GRADE = {"Faça com IA": "12:00", "Agente na Prática": "19:00", "Carrossel da Semana": "10:00"}
DIAS_DA_SERIE = {"Faça com IA": range(7), "Agente na Prática": range(7), "Carrossel da Semana": [5]}  # 0 = segunda; carrossel só no Instagram, sábado (Diego, 11/10)
# Grade nova do Diego (16/10/2026), valendo de 19/10: 12h "Radar IA" (notícias, feito pela vigia no próprio dia);
# 19h em rodízio de quadros. Ver /mnt/project-files/operacao/grade-2026-10-19.md.
GRADE_NOVA_DESDE = "2026-10-17"  # antecipada pelo Diego em 16/10 04h13 (era 19/10)
GRADE.update({"Radar IA": "12:00", "Agente do zero": "19:00", "Automação do zero": "19:00", "Termo de IA": "19:00", "Modelos e parâmetros": "19:00"})
DIAS_DA_SERIE.update({"Radar IA": range(7), "Agente do zero": [0, 2, 4], "Automação do zero": [1, 5], "Termo de IA": [3], "Modelos e parâmetros": [6]})
SERIES_ANTIGAS = {"Faça com IA", "Agente na Prática"}  # só até 18/10
SERIES_NOVAS = {"Radar IA", "Agente do zero", "Automação do zero", "Termo de IA", "Modelos e parâmetros"}
# formato "curto" (diretrizes de retenção do Diego, 11/10/2026): 15 a 25 s de fala, card final pode passar um pouco.
# "demo" (padrão até aqui): 35 a 45 s, quando a demonstração exige.
# "completo" (Diego, 16/10/2026, thread "Retenção: gancho e ritmo"): 35 s com passo a passo, ferramenta, pedido na tela,
# antes e depois e custo. Padrão a partir de 16/10; ver /mnt/project-files/operacao/roteiro-35s.md. "curto" fica só para vídeos antigos.
DURACOES = {"curto": (15.0, 27.0), "completo": (31.0, 38.0), "demo": (35.0, 45.0)}
CURTO_ATE = "2026-10-16"  # último dia com vídeos curtos já agendados
TITULO_MAX = 70
TRAVESSOES = "—–"
TRIGRAMA_MAX = 0.60
ORIGENS_OK = ("gerada por código", "gerada por ia", "captura própria")


def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    return "".join(c for c in s if not unicodedata.combining(c))


def palavras(s):
    return re.findall(r"[a-z0-9à-ü]+(?:-[a-z0-9à-ü]+)*", s.lower())


def trigramas(s):
    p = [norm(w) for w in palavras(s)]
    return {tuple(p[i:i + 3]) for i in range(len(p) - 2)}


def frases_da_narracao(r):
    return [f["fala"] for c in r["cenas"] for f in c["frases"]]


def duracao_mp4(caminho):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(caminho)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def termo_na_frase(termo, frase):
    return re.search(r"(?<![\wà-ü])" + re.escape(termo) + r"(?![\wà-ü])", frase.lower()) is not None


def validar(caminho, sem_mp4=False, trocar_slot=False):
    r = json.load(open(caminho))
    erros, avisos = [], []
    rid = r.get("id") or Path(caminho).stem
    serie, dia, hora = r.get("serie"), r.get("data"), r.get("horario")

    # grade: série no dia dela e no horário do slot, plataformas juntas
    if serie not in GRADE:
        erros.append(f"série '{serie}' não existe na grade ({', '.join(GRADE)})")
    else:
        if date.fromisoformat(dia).weekday() not in DIAS_DA_SERIE[serie]:
            erros.append(f"{serie} não sai em {dia}")
        if hora != GRADE[serie]:
            erros.append(f"horário {hora} não é o slot de {serie} ({GRADE[serie]})")
        if serie in SERIES_ANTIGAS and dia >= GRADE_NOVA_DESDE:
            erros.append(f"'{serie}' saiu da grade em {GRADE_NOVA_DESDE} (Diego, 16/10): 12h é Radar IA e 19h segue o rodízio do dia")
        if serie in SERIES_NOVAS and dia < GRADE_NOVA_DESDE:
            erros.append(f"'{serie}' só começa em {GRADE_NOVA_DESDE}")
    for plat, p in (r.get("plataformas") or {}).items():
        if p.get("data", dia) != dia or p.get("horario", hora) != hora:
            erros.append(f"{plat} ficou em dia ou horário diferente das outras plataformas")
    if date.fromisoformat(dia) < date.today():
        erros.append(f"data {dia} já passou")

    # duração estimada e real
    formato = r.get("formato", "demo")
    if formato not in DURACOES:
        erros.append(f"formato '{formato}' desconhecido ({', '.join(DURACOES)})")
        formato = "demo"
    if formato == "curto" and dia > CURTO_ATE:
        erros.append(f"formato 'curto' acabou em {CURTO_ATE} (Diego, 16/10): use \"formato\": \"completo\" (35 s)")
    DUR_MIN, DUR_MAX = DURACOES[formato]
    falas = frases_da_narracao(r)
    caracteres = sum(len(f) for f in falas)
    estimada = caracteres / 17 + 4.5
    if not DUR_MIN <= estimada <= DUR_MAX + 3:
        erros.append(f"duração estimada {estimada:.1f} s fora de {DUR_MIN:.0f} a {DUR_MAX:.0f} s ({caracteres} caracteres, formato {formato})")
    if not sem_mp4:
        mp4 = RAIZ / (r.get("video") or "")
        if not r.get("video") or not mp4.is_file():
            erros.append(f"MP4 não encontrado no repositório: {r.get('video')}")
        else:
            real = duracao_mp4(mp4)
            if not DUR_MIN <= real <= DUR_MAX:
                erros.append(f"duração real {real:.1f} s fora de {DUR_MIN:.0f} a {DUR_MAX:.0f} s")

    # título e descrição
    titulo, desc = r.get("titulo", ""), r.get("descricao", "")
    if not titulo:
        erros.append("sem título")
    if len(titulo) > TITULO_MAX:
        erros.append(f"título com {len(titulo)} caracteres (máximo {TITULO_MAX})")
    if not re.search(r"\bfontes?\b", desc, re.I):
        erros.append("descrição sem 'Fonte:' (vídeo sem números usa o site oficial da ferramenta)")

    # travessão em qualquer texto que vai ao ar
    textos = {"título": titulo, "descrição": desc, "comentário": r.get("comentario_fixado") or ""}
    for i, c in enumerate(r["cenas"]):
        for j, f in enumerate(c["frases"]):
            textos[f"cena {i} frase {j} narração"] = f["fala"]
            textos[f"cena {i} frase {j} legenda"] = f["legenda"]
    for onde, t in textos.items():
        if any(ch in t for ch in TRAVESSOES):
            erros.append(f"travessão em {onde}")

    # glossário: termo explicado na mesma frase; termo técnico fora do glossário barra
    g = json.load(open(CANAL / "glossario.json"))
    termos, liberados = g["termos"], {norm(x) for x in g.get("liberados", [])}
    conhecidos = {norm(t) for t in termos} | liberados
    for frase in falas:
        for termo, info in termos.items():
            if info.get("explicar") and termo_na_frase(termo, frase):
                if not any(p in frase.lower() for p in info.get("pistas", [])):
                    erros.append(f"'{termo}' sem explicação simples na frase: \"{frase}\"")
        for s in g.get("suspeitos", []):
            if termo_na_frase(s, frase) and norm(s) not in conhecidos:
                erros.append(f"termo técnico '{s}' fora do glossário (adicione com a explicação): \"{frase}\"")
        for sigla in re.findall(r"\b[A-Z]{2,}\b", frase):
            if norm(sigla) not in conhecidos:
                erros.append(f"sigla '{sigla}' fora do glossário e escrita como sigla na narração: \"{frase}\"")

    # imagens com origem
    origens = json.load(open(CANAL / "origens.json")).get(rid, {})
    if not r.get("imagens"):
        erros.append("roteiro sem a lista de imagens e origens")
    for img in r.get("imagens", []):
        o = origens.get(img["id"])
        if not o:
            erros.append(f"imagem '{img['id']}' sem entrada em canal/origens.json['{rid}']")
        elif not norm(o).startswith(tuple(norm(x) for x in ORIGENS_OK)):
            erros.append(f"origem da imagem '{img['id']}' fora das categorias aceitas: {o}")

    # promessa de prompt no comentário
    nar = " ".join(falas).lower()
    if "coment" in nar and re.search(r"prompt|modelo|texto pronto|link", nar) and not r.get("comentario_fixado"):
        erros.append("a narração promete algo no comentário e o roteiro não tem comentario_fixado")

    # dados reais: dado que envelhece precisa de fonte
    for d in r.get("dados_que_envelhecem", []):
        if not d.get("fonte") or not d.get("conferido"):
            erros.append(f"dado sem fonte ou data de conferência: {d.get('dado')}")

    # registro anti-repetição
    reg = json.load(open(CANAL / "registro.json"))["videos"]
    tri = trigramas(" ".join(falas))
    chaves = {norm(c) for c in r.get("registro", {}).get("chaves", [])}
    tema = norm(r.get("registro", {}).get("tema", ""))
    refaz = r.get("refaz")  # teste controlado: nova versão de um vídeo publicado, mesmo tema de propósito
    for v in reg:
        if v["id"] == rid:
            continue
        if refaz and v["id"] == refaz:
            avisos.append(f"refaz o vídeo {refaz} (teste controlado): repetição de tema liberada")
            continue
        if norm(v["titulo"]) == norm(titulo):
            erros.append(f"título igual ao do vídeo {v['id']}")
        antigo = trigramas(v.get("narracao", ""))
        if tri and antigo:
            parecido = len(tri & antigo) / min(len(tri), len(antigo))
            if parecido >= TRIGRAMA_MAX:
                erros.append(f"narração {parecido:.0%} parecida com a do vídeo {v['id']} (trigramas de palavras)")
        vchaves = {norm(c) for c in v.get("registro", {}).get("chaves", [])}
        mesmo = tema and (tema == norm(v.get("registro", {}).get("tema", "")) or
                          (chaves and len(chaves & vchaves) / len(chaves) >= 0.5))
        if mesmo:
            (erros if v.get("serie") == serie else avisos).append(
                f"assunto repetido com o vídeo {v['id']} ({v['serie']})")
        if v.get("status") in ("agendado", "publicado") and v.get("data") == dia and v.get("horario") == hora and not (trocar_slot and v.get("status") == "agendado"):
            erros.append(f"slot {dia} {hora} já ocupado pelo vídeo {v['id']}")

    return erros, avisos, {"caracteres": caracteres, "estimada": round(estimada, 1)}


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    erros, avisos, info = validar(args[0], "--sem-mp4" in sys.argv, "--trocar-slot" in sys.argv)
    for a in avisos:
        print("AVISO:", a)
    if erros:
        print("BARRADO:")
        for e in erros:
            print(" -", e)
        sys.exit(1)
    print(f"OK: {args[0]} ({info['caracteres']} caracteres, estimativa {info['estimada']} s)")
