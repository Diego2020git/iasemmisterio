# Diretrizes de retenção (Diego, 11/10/2026)

Valem para toda produção nova do IA Sem Mistério a partir de 12/10/2026. A identidade não muda: Raio-X (planta em traço, Archivo Expanded + Archivo, azul-marinho/preto/azul elétrico/ciano, lente com "IA"), voz Fenrir, kit `raiox-kit.js` + `raiox-motion.js`, legenda com a palavra acesa, card final. O que muda é o roteiro, o gancho e o ritmo.

Nenhuma regra aqui garante viralização. Ela organiza testes; os Insights decidem o que fica.

## 1. O diagnóstico que originou isto

Vídeo 06 (carrossel com IA, 36 s, publicado 09/10 19h), Insights do Instagram via Metricool em 11/10:
40 views, 3,1 s de tempo médio, só 24% passaram dos 3 s (75,8% pulados), 0 curtidas, 0 compartilhamentos, 0 salvamentos.

Os outros Reels tiveram de 1 a 5 views, amostra pequena demais para concluir algo. O 06 foi o único distribuído para quem não segue o perfil, e lá o problema ficou claro: quem chega não fica.

Por que a abertura do 06 perdia gente (quadros de 0 a 3 s):
- Quadro 1 quase vazio: título entrando e uma planta em branco. Não havia nada "acontecendo".
- A fala abre com "Dá pra criar…" e gasta 1,3 s em "Olha como", uma promessa sem resultado.
- O título descrevia o assunto ("Carrossel em 10 minutos"), não mostrava o resultado.
- 36 s com quatro passos numerados: o ritmo parecia aula.

O que já funciona e fica:
- Identidade Raio-X: diferente dos canais de IA genéricos, legível, consistente.
- Motion sincronizado com a fala (`cue()`), legenda com a palavra acesa, transição por varredura.
- Selos das ferramentas reais com "tem plano grátis".
- Temas validados com dados de busca e úteis de verdade.
- Prompt pronto como bônus que dá motivo para salvar.

## 2. Regras do roteiro

**Duração.** Teste inicial: 15 a 25 s (`"formato": "curto"` no JSON do roteiro, cerca de 250 a 330 caracteres de fala). Só use `"formato": "demo"` (35 a 45 s) quando a demonstração não cabe; anote o motivo no campo `teste`.

**Estrutura (ajuste os tempos ao conteúdo):**

| Tempo | Função | Como fazer no kit |
|---|---|---|
| 0 a 2 s | Gancho visual e verbal | Resultado pronto já no quadro 1 e se mexendo. Título cinético com o resultado (a cena 0 já mostra o título inteiro no quadro 1). |
| 2 a 7 s | Ferramenta ou solução | `toolCard` com o nome real e "tem plano grátis" quando for verdade. |
| 7 a 15 s | Demonstração | A ferramenta trabalhando: texto sendo digitado, lista aparecendo, planilha preenchendo. Uma mudança visual a cada 1,5 a 3 s. |
| 15 a 20 s | Benefício concreto | O antes e depois, o tempo economizado, o que a pessoa ganha. |
| 20 a 25 s | Conclusão e CTA | Uma frase. `endCard`. |

**Gancho (escolha um por vídeo e anote qual no campo `teste`):**
- Resultado: "Carrossel pronto em 10 minutos. E de graça."
- Problema: "Sua planilha dá erro toda hora?"
- Curiosidade ou descoberta: "O Google tem uma IA de vídeo grátis que quase ninguém usa."
Proibido abrir com "Olha como", "Hoje eu vou te mostrar", "Você sabia", saudação ou nome do canal.

**Linguagem.** Frases de até 12 palavras. Benefício antes do detalhe técnico. Sem passo numerado quando couber sem ("Um:, Dois:" só se forem 3 passos ou menos e cada um mostrar algo novo). Corte toda frase que não muda o que a pessoa faz.

**Verdade.** Ferramenta grátis só com "tem plano grátis" conferido no dia, com fonte e data na descrição. Limites (créditos, marca d'água, número de vídeos) na legenda. Não prometer função que a ferramenta não tem. Nada pago apresentado como grátis.

## 3. Regras visuais

- Quadro 1 nunca vazio: o objeto do resultado já está desenhado inteiro e algo se move antes de 0,5 s.
- Texto na tela grande: título cinético 84 a 96 px, nada importante abaixo de 34 px.
- Legenda sincronizada (a do kit) em todos os quadros com fala.
- Câmera: empurrão leve por cena (`CAMS`), sem giro. Troca de cena por varredura.
- Nada de slide parado: em cada cena, algo é desenhado, digitado, preenchido ou anotado no tempo da fala.
- Capa = último quadro da cena 0 (`canal/capa.py`). Garanta que esse quadro mostra o resultado e o título inteiro.
- Continua valendo: nada torto, nada sobreposto, sem glow, sem partícula, sem robô genérico. Conferir a folha de quadros antes do render.

## 4. Narração

Voz Fenrir (Google Chirp 3 HD), velocidade 1,06, loudnorm -14 LUFS (`kit/voz.py`). Frases curtas dão pausas naturais. Uma frase longa sem vírgula pode virar uma única legenda; se o `voz.py` dividir errado, junte as duas frases numa só (aconteceu no teste 1).

## 5. Engajamento

- Um CTA por vídeo, natural, no fim: salvar (quando há algo para consultar depois, como um prompt) ou seguir com o benefício ("todo dia tem um atalho de IA novo").
- Pergunta para comentário vai na legenda do post, ligada ao tema ("Qual tema você faria primeiro?"). Não pedir curtida, compartilhamento, salvamento e seguir ao mesmo tempo.
- Prompt pronto na legenda (não depende do comentário fixado).

## 6. Testes controlados

Um teste muda no máximo duas variáveis em relação a um vídeo já publicado, mantendo tema e identidade. Ordem planejada:

| # | O que muda | Base | Estado |
|---|---|---|---|
| 1 | Gancho (resultado pronto no quadro 1) + ritmo (36 s → 22,5 s) | vídeo 06 | pronto em 12/10, aguarda data de publicação |
| 2 | Legenda maior (50 → 64 px) | resultado do 1 | depois do 1 |
| 3 | CTA com benefício de seguir + pergunta na legenda | resultado do 2 | depois do 2 |
| 4 | Gancho de problema x gancho de resultado | mesmo tema, dois vídeos | depois do 3 |

No teste 1 a voz também mudou (Charlie no original, Fenrir agora, porque o Charlie dependia de créditos do vidIQ). Por isso o teste 1 também é comparado com os vídeos Fenrir de 40 s publicados de 11/10 a 15/10.

**Como medir (Metricool, rede Instagram, conector reels):** views (IGRE23), tempo médio (IGRE24), retenção média (IGRE27), quem passou de 3 s (IGRE28), curtidas (IGRE10), compartilhamentos (IGRE21), salvamentos (IGRE12). Ler em 24 h, 72 h e 7 dias depois do post. Seguidores ganhos: evolução do perfil no mesmo período.

**O que conta como melhora (com cautela, amostras pequenas):** passar de 3 s acima de 40% e tempo médio acima de 40% da duração. Com menos de 100 views, registrar e repetir antes de concluir.

Registrar cada leitura em `canal/registro.json` (campo `metricas` do vídeo) e na tabela acima.

## 7. Checklist antes de agendar

1. Gancho em até 2 s, de resultado, problema ou descoberta. Sem "olha como".
2. Quadro 1 com o resultado inteiro e algo se movendo.
3. Duração dentro do formato (curto 15 a 25 s).
4. Mudança visual a cada 1,5 a 3 s.
5. Benefício antes do detalhe técnico.
6. Grátis só com fonte e data; limites na legenda.
7. Um CTA; pergunta na legenda do post.
8. Capa mostra o resultado e o título inteiro.
9. `python3 canal/validar.py` passou.
