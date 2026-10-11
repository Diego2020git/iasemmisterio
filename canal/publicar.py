"""Agenda um roteiro validado no Buffer (principal) e prepara a reserva do Metricool.

Uso:
  python3 canal/publicar.py canal/roteiros/X.json            agenda Instagram e YouTube
  python3 canal/publicar.py canal/roteiros/X.json --so-buffer  Instagram também pelo Buffer, com o prompt na legenda
  python3 canal/publicar.py canal/roteiros/X.json --substituir apaga os posts antigos desse roteiro no Buffer e agenda de novo
  python3 canal/publicar.py --agenda [dias]                    lista o que está agendado no Buffer (padrão: 7 dias)
  python3 canal/publicar.py --apagar <id_do_post_buffer>       apaga um post do Buffer

Regras:
- Roda canal/validar.py antes e se recusa a agendar se ele barrar.
- O MP4 precisa estar no GitHub (commit e push antes): o link raw do ramo atual (ou RAW_REF) tem que responder 200.
  Buffer e Metricool copiam o vídeo ao agendar, mas não apague o ramo antes de o post sair.
- Buffer Free não aceita primeiro comentário no Instagram. Se o roteiro tem comentario_fixado, o Instagram vai
  pelo Metricool (firstCommentText): o script grava canal/metricool/<id>.json e a sessão agenda com a ferramenta
  createScheduledPost do Metricool, depois roda --metricool-ok <id> <link_do_planner>. Sem cota no Metricool, use --so-buffer.
- YouTube sempre pelo Buffer, com o prompt no fim da descrição. O comentário no YouTube é do Diego.
- Todo post sai com o rótulo de conteúdo feito com IA.
- Capa: o Instagram recebe thumbnailOffset no último quadro da abertura (canal/capa.py). O YouTube Shorts escolhe a capa sozinho;
  a imagem videos/<nome>-capa.jpg serve para o Metricool (videoThumbnailUrl) e para conferir.
Precisa de BUFFER_API_KEY no ambiente.
"""
import json, os, subprocess, sys, urllib.request
from capa import instante_capa
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

RAIZ = Path(__file__).resolve().parent.parent
CANAL = RAIZ / "canal"
REPO_RAW = "https://raw.githubusercontent.com/Diego2020git/iasemmisterio/{ref}/"


def ramo_atual():
    """Ramo do link raw: RAW_REF, se definido, senão o ramo do git (precisa estar no GitHub)."""
    return os.environ.get("RAW_REF") or subprocess.run(["git", "-C", str(RAIZ), "rev-parse", "--abbrev-ref", "HEAD"],
                                                       capture_output=True, text=True, check=True).stdout.strip()
FUSO = ZoneInfo("America/Sao_Paulo")
ORG = "6acb05611f8562f188638ddd"
CANAIS = {"instagram": "6acb065d778b240e2fd1e973", "youtube": "6acb05c0778b240e2fd1e6ca"}
METRICOOL_BLOG = "7280938"


def gql(query, variables=None):
    req = urllib.request.Request("https://api.buffer.com", json.dumps({"query": query, "variables": variables or {}}).encode(),
                                 {"Authorization": "Bearer " + os.environ["BUFFER_API_KEY"], "Content-Type": "application/json"})
    resp = json.load(urllib.request.urlopen(req, timeout=90))
    if resp.get("errors"):
        raise RuntimeError(json.dumps(resp["errors"], ensure_ascii=False))
    return resp["data"]


CRIAR = """mutation($i: CreatePostInput!) { createPost(input: $i) {
  __typename ... on PostActionSuccess { post { id status dueAt } } ... on MutationError { message } } }"""


def link_ok(url):
    try:
        req = urllib.request.Request(url, method="HEAD")
        return urllib.request.urlopen(req, timeout=60).status == 200
    except Exception:
        return False


def quando(r):
    local = datetime.fromisoformat(f"{r['data']}T{r['horario']}:00").replace(tzinfo=FUSO)
    return local, local.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def com_prompt(texto, r):
    c = r.get("comentario_fixado")
    return texto if not c else f"{texto}\n\n{c}"


def criar(canal, r, url, due):
    video = {"url": url}
    if canal == "instagram":  # capa = último quadro da abertura (canal/capa.py); o Buffer só aceita o instante, e só no Instagram
        video["metadata"] = {"thumbnailOffset": int(instante_capa(r) * 1000)}
    base = {"channelId": CANAIS[canal], "assets": [{"video": video}], "mode": "customScheduled",
            "dueAt": due, "schedulingType": "automatic", "aiAssisted": True, "source": "iasemmisterio/publicar.py"}
    if canal == "instagram":
        base["text"] = r["_legenda_ig"]
        base["metadata"] = {"instagram": {"type": "reel", "shouldShareToFeed": True, "isAiGenerated": True}}
    else:
        base["text"] = com_prompt(r["descricao"], r)
        base["metadata"] = {"youtube": {"title": r["titulo"], "privacy": "public", "categoryId": "27",
                                        "madeForKids": False, "isAiGenerated": True, "notifySubscribers": True}}
    res = gql(CRIAR, {"i": base})["createPost"]
    if res["__typename"] != "PostActionSuccess":
        raise RuntimeError(f"Buffer recusou {canal}: {res.get('message')}")
    return res["post"]


def apagar(pid):
    res = gql('mutation($i: DeletePostInput!) { deletePost(input: $i) { __typename ... on MutationError { message } } }',
              {"i": {"id": pid}})["deletePost"]
    return res["__typename"]


def agenda(dias=7):
    agora = datetime.now(timezone.utc)
    q = """query($i: PostsInput!, $a: String) { posts(first: 50, after: $a, input: $i) {
      edges { node { id status dueAt channelService text error { message } metadata { __typename } } }
      pageInfo { hasNextPage endCursor } } }"""
    filtro = {"organizationId": ORG, "filter": {"status": ["scheduled", "error", "sending"],
              "dueAt": {"start": agora.isoformat(), "end": (agora + timedelta(days=dias)).isoformat()}}}
    out, a = [], None
    while True:
        d = gql(q, {"i": filtro, "a": a})["posts"]
        out += [e["node"] for e in d["edges"]]
        if not d["pageInfo"]["hasNextPage"]:
            break
        a = d["pageInfo"]["endCursor"]
    return sorted(out, key=lambda p: p["dueAt"] or "")


def registrar(r, campos):
    p = CANAL / "registro.json"
    reg = json.load(open(p))
    v = next((x for x in reg["videos"] if x["id"] == r["id"]), None)
    if v is None:
        v = {"id": r["id"]}
        reg["videos"].append(v)
    v.update({"data": r["data"], "horario": r["horario"], "serie": r["serie"], "titulo": r["titulo"],
              "narracao": " ".join(f["fala"] for c in r["cenas"] for f in c["frases"]), "video": r["video"],
              "registro": r.get("registro", {})})
    v.update(campos)
    json.dump(reg, open(p, "w"), ensure_ascii=False, indent=1)
    return v


def publicar(caminho, so_buffer=False, substituir=False):
    val = subprocess.run([sys.executable, str(CANAL / "validar.py"), caminho], capture_output=True, text=True)
    print(val.stdout.strip())
    if val.returncode != 0:
        sys.exit("Não agendei: o validador barrou.")
    r = json.load(open(caminho))
    url = REPO_RAW.format(ref=ramo_atual()) + r["video"]
    if not link_ok(url):
        sys.exit(f"Não agendei: o MP4 ainda não responde no GitHub ({url}). Faça commit e push antes.")
    local, due = quando(r)
    if local <= datetime.now(FUSO) + timedelta(minutes=15):
        sys.exit(f"Não agendei: {local:%d/%m %H:%M} já passou ou está a menos de 15 minutos.")

    reg = json.load(open(CANAL / "registro.json"))
    antigo = next((x for x in reg["videos"] if x["id"] == r["id"]), {})
    if antigo.get("buffer") and not substituir:
        sys.exit(f"Já agendado no Buffer ({antigo['buffer']}). Use --substituir para trocar.")
    if substituir:
        for pid in (antigo.get("buffer") or {}).values():
            print("apagado do Buffer:", pid, apagar(pid))

    ig_metricool = bool(r.get("comentario_fixado")) and not so_buffer
    r["_legenda_ig"] = r["descricao"] if ig_metricool else com_prompt(r["descricao"], r)
    feitos = {"youtube": criar("youtube", r, url, due)["id"]}
    campos = {"status": "agendado", "agendador": "Buffer", "buffer": feitos, "media": url}
    if ig_metricool:
        CANAL.joinpath("metricool").mkdir(exist_ok=True)
        pedido = {"blogId": METRICOOL_BLOG, "date": local.isoformat(), "info": {
            "text": r["descricao"], "firstCommentText": r["comentario_fixado"], "media": [url], "autoPublish": True,
            "draft": False, "providers": [{"network": "instagram"}],
            "publicationDate": {"dateTime": local.strftime("%Y-%m-%dT%H:%M:%S"), "timezone": "America/Sao_Paulo"},
            "instagramData": {"type": "REEL", "showReelOnFeed": True, "isAiGenerated": True}}}
        capa = url.rsplit(".", 1)[0] + "-capa.jpg"
        if link_ok(capa):
            pedido["info"]["videoThumbnailUrl"] = capa
        arq = CANAL / "metricool" / f"{r['id']}.json"
        json.dump(pedido, open(arq, "w"), ensure_ascii=False, indent=1)
        campos["metricool"] = {"instagram": "pendente"}
        print(f"Instagram vai pelo Metricool (tem comentário): agende com createScheduledPost usando {arq.relative_to(RAIZ)}")
    else:
        feitos["instagram"] = criar("instagram", r, url, due)["id"]
    registrar(r, campos)
    print(f"Agendado {local:%d/%m %H:%M}: " + ", ".join(f"{k} {v}" for k, v in feitos.items()))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "--agenda":
        for p in agenda(int(a[1]) if len(a) > 1 else 7):
            hora = datetime.fromisoformat(p["dueAt"].replace("Z", "+00:00")).astimezone(FUSO)
            erro = f"  ERRO: {p['error']['message']}" if p.get("error") else ""
            print(f"{hora:%a %d/%m %H:%M}  {p['channelService']:<9} {p['status']:<9} {p['id']}  {(p['text'] or '')[:50]!r}{erro}")
    elif a[0] == "--apagar":
        print(apagar(a[1]))
    elif a[0] == "--metricool-ok":
        p = CANAL / "registro.json"
        reg = json.load(open(p))
        v = next(x for x in reg["videos"] if x["id"] == a[1])
        v.setdefault("metricool", {})["instagram"] = a[2] if len(a) > 2 else "agendado"
        json.dump(reg, open(p, "w"), ensure_ascii=False, indent=1)
        print("registro atualizado:", v["id"], v["metricool"])
    else:
        publicar(a[0], "--so-buffer" in a, "--substituir" in a)
