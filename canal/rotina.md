# canal/rotina.md (aprovada pelo Diego em 11/10/2026, 03:56 UTC)

Fonte da verdade da operação IA Sem Mistério. Toda rotina começa com `git pull` e relendo este arquivo.
Regras completas: /mnt/project-files/operacao/prompt-operacao-v2.md.

## Grade fixa (2 vídeos por dia, revisada em 11/10 após a escolha Buffer + Metricool)

| Dia | Horário | Série | O que é |
|---|---|---|---|
| Todos | 12h | Faça com IA | Uma tarefa do dia a dia resolvida com uma ferramenta que tem plano grátis. |
| Todos | 19h | Agente na Prática | A partir de 19/10 (Diego, card "Série do zero" de 16/10): série "Monte seu agente do zero", um episódio por dia, na ordem, até o agente responder no WhatsApp. Ver a seção da série abaixo. Até 18/10: agentes soltos, já agendados. |
| Sábado | 10h | Carrossel da Semana | Só no Instagram (escolha do Diego em 11/10). Resume o melhor tutorial da semana em 7 a 10 slides no traço Raio-X, com o prompt no último slide. Primeiro em 17/10, feito na produção de quarta. Teste em 11/10 15h (4 IAs grátis). Como fazer: HTML 1080x1350 em kit/carrossel-*.html (render(i) = slide i), `node kit/render.mjs pagina.html pasta stills 0,1,...`, JPGs em carrosseis/<data-slug>/, Buffer createPost com assets image e metadata.instagram.type post (testado, aceita 8 imagens). 17/10 (fórmula de planilha, 7 slides, kit/carrossel-2026-10-17-formula-planilha.html) foi pelo Metricool com publicação automática e sem música, porque o Buffer grátis estava com o Instagram cheio (10 de 10). |

Fuso America/Sao_Paulo. Instagram e YouTube no mesmo dia e horário.

## Agendamento

- **Buffer Free (principal):** fila de no máximo 10 posts por rede ao mesmo tempo, sem teto mensal. Com 2 vídeos por dia, a fila cobre 5 dias à frente. BUFFER_API_KEY e api.buffer.com funcionam (testado em 11/10). Canais: Instagram iasemmisterio.ai e YouTube IA Sem Mistério. Vídeo vai por link raw do GitHub.
- **Primeiro comentário:** o Buffer Free não aceita no Instagram. Roteiro com comentario_fixado: o Instagram vai pelo Metricool (firstCommentText) e o YouTube pelo Buffer com o prompt no fim da descrição. Sem cota no Metricool, `--so-buffer` põe o prompt na legenda. Roteiros novos preferem dizer "o prompt está na legenda" para não depender do comentário.
- **Metricool Free (reserva e métricas):** 20 posts por mês (outubro já usou 12 com os vídeos 01 a 06). Fica com a coleta de métricas, com o Instagram dos vídeos que têm comentário e entra se o Buffer falhar. Marca blogId 7280938.
- Se os dois recusarem, anotar aqui e avisar o Diego.
- Voz: cerca de 650 caracteres por vídeo, 60 vídeos por mês, uns 39 mil caracteres, bem abaixo do 1 milhão grátis do Google.

## Fila inicial (da pauta)

- Faça com IA: 08 IA que cria vídeos de graça, 09 editar vídeo com IA, 14 texto em vídeo, 10 estudar para concurso, 11 qual a melhor IA.
- Agente na Prática: 07 agente no ChatGPT de graça, 13 agente para vendas e atendimento, 12 Gemini como assistente pessoal.
Cada tema é revalidado na YouTube Data API antes de virar roteiro.

## Arquivos

- kit/: raiox-kit.js, raiox-motion.js, render.mjs, voz.py, fontes/, HTML de cada vídeo e audio/ com os tempos.
- canal/roteiros/: um JSON por vídeo. canal/validar.py, canal/publicar.py, canal/glossario.json, canal/origens.json, canal/registro.json.
- videos/: MP4 finais (link raw usado no agendamento).

## Rotinas

- **Vigia diária, 6h30:** lê a agenda real (`python3 canal/publicar.py --agenda 7` e getScheduledPosts do Metricool), confere série, dia, horário, vídeo e rótulo de IA, conserta, produz o slot que faltar e faz a checagem de véspera.
- **Produção, domingo, quarta e sexta às 7h:** produz os slots vazios até encher a fila do Buffer (5 dias à frente).
- **Mínimo de segurança:** hoje e os 3 dias seguintes sempre agendados.
- Criadas em 11/10/2026, disparando no thread "Buffer: testar agendamento": vigia todo dia 6h27 e produção dom, qua e sex 6h52 (minutos deslocados para não cair na hora cheia). A rotina antiga das 6h49 foi apagada.

## Passo a passo de cada rodada

1. `git pull`, reler este arquivo e canal/registro.json.
2. Pesquisa: YouTube Data API, últimos 30 dias, pt-BR. Demanda = soma das visualizações dos 10 primeiros; concorrência = quantos são de canais com mais de 100 mil inscritos. Reforço: sugestões do YouTube e Google Trends Brasil (os dois respondem neste ambiente). Teto de 3 mil unidades por rodada.
3. Roteiro em canal/roteiros/AAAA-MM-DD-serie.json.
4. Voz: Google Cloud TTS, voz escolhida pelo Diego, velocidade 1,06, WAV 24 kHz mono, loudnorm -14 LUFS, por cena. Anotar caracteres gastos no mês.
4b. `python3 kit/voz.py canal/roteiros/X.json kit/audio/NN-slug` (gera .wav e .tempos.js).
5. Montagem com o kit Raio-X de kit/ (raiox-kit.js + raiox-motion.js, cue() sincroniza com a fala): `node kit/render.mjs kit/NN-slug-raiox.html videos/NN-slug-raiox-final.mp4 kit/audio/NN-slug.wav`.
   - Regras de forma (Diego, 11/10): nada torto nem sobreposto. Câmera não gira, objeto 3D fica em vista fixa (sem rodar), selo reto, troca de forma por encolher e crescer (sem deformar), transição por varredura. Objeto achatado (celular, papel) vai em traço 2D, não em 3D. Antes de renderizar, conferir a folha de quadros a cada 1,5 s: nada cortado na borda, nenhum texto em cima de forma. O título da abertura aparece inteiro no quadro 1 (kinetic faz isso sozinho na cena 0). Depois do render, `python3 canal/capa.py canal/roteiros/X.json` gera a capa (último quadro da abertura); o publicar.py usa o mesmo instante como capa do Instagram.
6. `python3 canal/validar.py canal/roteiros/X.json` (antes da voz, use `--sem-mp4`). Se barrar, corrigir e rodar de novo.
7. MP4 em videos/ do repositório, commit e push.
8. `python3 canal/publicar.py canal/roteiros/X.json`: valida de novo, confere o link raw e agenda no Buffer com rótulo de IA. Se imprimir que o Instagram vai pelo Metricool, agendar com createScheduledPost usando canal/metricool/<id>.json e rodar `--metricool-ok <id> <plannerUrl>`. Se o Buffer recusar, agendar tudo pelo Metricool e anotar aqui.
9. Conferir na agenda real, atualizar este arquivo, a pauta, o registro e a memória. Commit e push.
10. Mensagem curta: tabela Dia | Horário | Vídeo | Série, agendado até quando, comentários a fixar e problemas.

## Série "Monte seu agente do zero" (19h, a partir de 19/10/2026)

- Decisão do Diego no card de 16/10 ("Série do zero"). Plano, ferramentas, custos e regras em /mnt/project-files/operacao/serie-agente-do-zero.md (ler antes de cada episódio).
- Ep 1 no primeiro 19h ainda não produzido (19/10), depois um por dia na ordem dos 11 episódios: sem pular nem repetir. O que já estava agendado (até 18/10) fica.
- Ferramentas fixas a série toda: Gemini API pelo Google AI Studio (cérebro), Make.com (ligações), WhatsApp Cloud API da Meta (boca).
- Formato "completo" de 35 s; o bloco final é "amanhã: <próximo passo>" + logo. Título "Agente do zero #N: <passo>" (no roteiro, campo "serie_ep": N). Capa com o número grande do episódio. Legenda com os passos por escrito e "episódio anterior: #N-1". No YouTube, playlist "Monte seu agente do zero".
- Neon com trilha de 17 a 23/10. Na tela, só nomes reais de botões e menus; se não tiver certeza do nome, mostrar a ação ("abra a área de chaves"). Nunca mostrar uma chave de API de verdade.
- Ep 10: antes de ir ao ar, conferir na página de preços da Meta se a cobrança anunciada para 01/10/2026 existe.
- Cada episódio pronto: copiar o MP4 para /mnt/project-files/videos/ e mandar o caminho à sessão do thread de retenção (session_01KnRMZcWxFwradJVTTVCgGb).

## Duração: 35 s com conteúdo completo (Diego, 16/10/2026 01h, thread "Retenção: gancho e ritmo")

- O Diego achou os vídeos de 18 a 24 s incompletos e repetitivos ("não está ensinando nada produtivo") e voltou para 35 s. Os curtos de 17 e 18/10 já agendados ficam como estão.
- Todo roteiro novo leva `"formato": "completo"` (o validar.py barra "curto" depois de 18/10). Fala de uns 32 s (cerca de 470 a 560 caracteres) + logo.
- Estrutura fixa (detalhe e exemplo em /mnt/project-files/operacao/roteiro-35s.md): 0-3 gancho com o resultado pronto e o problema; 3-7 por que importa; 7-25 três passos numerados com a ferramenta nomeada, onde clicar e o pedido (prompt) completo na tela por pelo menos 3 s; 25-31 antes e depois + custo ou limite do plano grátis conferido no dia; 31-35 uma chamada só + logo.
- Todo vídeo responde: o que eu ganho, com qual ferramenta e como faço. O pedido completo também vai na legenda do post.
- "Agente na Prática" sempre nomeia a ferramenta pra montar o agente (ex.: n8n, Make, Zapier), diz quanto custa e mostra os 3 passos de montagem; só mostrar o agente funcionando não basta.
- Temas: nada de repetir assunto já publicado ou agendado (conferir canal/registro.json antes de escolher). Cada vídeo ensina uma tarefa nova e útil.
- O estilo neon com trilha continua até 23/10.

## Teste 2 de 17 a 23/10: estilo neon (Diego, 14/10 02h48, thread "Retenção: gancho e ritmo")

- O personagem narrador foi ADIADO: não usar por enquanto. O modelo fica em kit/2026-10-14-12h-logo-gemini-personagem.html e kit/envelope.py gera a boca, para quando ele voltar.
- De 17 a 23/10 os vídeos saem no estilo neon: fundo preto, luz colorida vindo de baixo, um elemento por vez no centro, ícones 3D com brilho em azul elétrico e ciano, celular, roda de cartões, cursor 3D e texto limpo com rastro de luz. Modelo e peças vêm do thread de retenção.
- Diego escolheu "Todos" no card (14/10 02h50): de 17 a 23/10 TODOS os vídeos, das 12h e das 19h, saem em neon e com a trilha. Não há controle em Raio-X nesta semana; a comparação é com a semana anterior.
- Continua valendo: título no quadro 1, nada sobreposto e folha de quadros antes do render.
- Kit pronto: kit/neon-kit.js (peças do modelo + fim() com a logo, selo(), exemplo(), ícones extras e renderAudio() com os tempos do vídeo) e kit/_neon_head.txt. Exemplos: kit/2026-10-17-12h-legenda-clipchamp-neon.html e kit/2026-10-17-19h-agente-clinica-neon.html. A página define SC (cenas da voz + cena final da logo em "salva"), DURATION, COR, S, CK, CLIQUES, HITS e IMPACTO.
- Modelo neon: kit/marca-apresentacao-neon.html (commit 3c2a250 do thread de retenção), logo em kit/marca/logo.png (nunca redesenhar).
  - Peças reaproveitáveis: fundo()/luz()/acabamento() com a cor de cada cena em COR; frase() (texto com rastro de luz e palavra em destaque); neon3d(path) com os ícones em P (engrenagem, relógio, coração, balão, seta, check). Ícone novo é um path num quadrado de -100 a 100. Também celular() com msg() (tela de ferramenta), roda() com os ícones em IC, cursor() com os keyframes CK [t, x, y, tamanho, giro] (longe do texto) e a transição zoom, desfoque e flash em render().
  - Layout: um elemento por vez, centrado em y≈860. Nada abaixo de y 1650 nem à direita de x 960.
  - Trilha: TODO vídeo neon leva a música gerada por renderAudio(). Ajustar os tempos de whoosh, clique e impacto às cenas (SC) e ao DURATION de cada vídeo. `node kit/render.mjs pagina.html trilha.wav audio` e depois mixar com a voz: ffmpeg -i trilha.wav -i voz.wav -filter_complex "[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=<duração da trilha>,asplit=2[v][sc];[0:a]volume=0.55[m0];[m0][sc]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=350[m];[m][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" final.wav (o apad é obrigatório: sem ele o vídeo corta o final da logo). Renderizar o vídeo com esse final.wav.
  - Cursor (pedido da retenção, 14/10): fica PARADO ao lado do elemento principal de cada cena e só se move nas trocas de cena (CPOS por cena gera o CK, ver os neon de 17/10). Nunca sobre uma linha de texto nem cruzando uma no caminho; nunca sozinho na tela (tamanho 0 até o elemento aparecer, ou some na cena sem clique). Conferir na folha de quadros antes de renderizar.

## Estado dos serviços (11/10/2026)

| Serviço | Estado |
|---|---|
| GOOGLE_API_KEY | definida |
| BUFFER_API_KEY / api.buffer.com | funcionam (11/10); primeiro comentário no IG só no plano pago |
| YouTube Data API v3 | responde |
| Google Cloud TTS (Chirp 3 HD pt-BR) | responde |
| suggestqueries.google.com | responde |
| trends.google.com | responde (RSS de tendências do Brasil) |
| Azure Speech | bloqueado pela rede |
| ELEVENLABS_API_KEY, RUNWAYML_API_SECRET | vazias |

## Gasto do mês

| Mês | Caracteres de voz (Google) | Unidades YouTube API |
|---|---|---|
| 10/2026 | ~10.300 até 14/10 (948 de teste + 16 vídeos e regravações), de 1 milhão grátis | ~3.600 até 14/10 (cota grátis de 10 mil por dia) |
