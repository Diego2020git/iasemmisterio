# canal/rotina.md (aprovada pelo Diego em 11/10/2026, 03:56 UTC)

Fonte da verdade da operação IA Sem Mistério. Toda rotina começa com `git pull` e relendo este arquivo.
Regras completas: /mnt/project-files/operacao/prompt-operacao-v2.md.

## Padrão de entrega (Diego, 24/10/2026): vale para TODO vídeo e carrossel a partir de agora

O Diego recusou duas versões do extra do PHP ("muito ruim", "visual e conteúdo muito raso") e aprovou a v3 com "Ficou bom, pode postar, atualize o sistema para criar com esse nível de entrega ou superior" (24/10, 18h40Z). A v3 é a régua mínima de Radar, séries, extras e carrossel. Referência: branch claude/project-thread-thpb2r, kit/2026-10-24-extra-php2shell-neon.html (não apagar o branch). Régua completa: /mnt/project-files/operacao/padrao-de-entrega.md.

Conteúdo (profundidade, não resumo):
- Explicar COMO funciona, não só o que aconteceu: o mecanismo em 2 ou 3 passos simples.
- Sempre responder: o que é, como funciona, quem é afetado ou quem pode usar (nomes reais de produto, versão, plano, país), o contexto e o papel da IA (com precisão e fonte), a linha do tempo (datas) e o que fazer (passos numerados com nomes reais de menu, botão e versão).
- Nome técnico sempre com a tradução simples na mesma frase.
- Dizer também o limite: o que não resolve, o que é pago, onde ainda não chegou.
- Nada inventado: cada número na tela tem fonte em dados_que_envelhecem; afirmação que não bate com a fonte primária sai ou vem com "segundo X".
- Duração: extras e notícias avulsas, a que o conteúdo pedir ("formato": "livre", 35 a 90 s). Radar segue "radar-60" (card do Diego de 16/10) até ele dizer outra coisa, mas com a mesma profundidade por segundo: menos frase de efeito, mais mecanismo. Séries seguem 35 s ("completo") com o mecanismo mostrado em cada passo.

Visual (cena que mostra o mecanismo):
- Toda página nova carrega kit/neon-entrega.js depois de neon-extra.js. Ele liga sozinho o chão de grade em perspectiva com partículas e a legenda grande palavra por palavra (Archivo Expanded 66, caixa alta, palavra atual em ciano, y≈1480). Peças prontas: titulo() (caixa alta, palavra-chave em destaque, largura máx. 840), versao() (etiqueta grande, risco vermelho), pilula(), setaH(), fio() (conexão com pulso), linhaDoTempo(), P.escudo, P.servidor, flut().
- Cada cena é uma animação do conceito, não texto na tela: dados que viajam, medidor que enche, linha do tempo que se desenha, painel com o botão sendo clicado, versões riscadas, feixe de IA varrendo.
- Elementos grandes entre y 400 e 1300; nada pequeno solto, nada cortado. A faixa y 1400 a 1560 é da legenda: nada de selo, exemplo() ou fonte ali (a fonte vai na legenda do post).
- Cores: vermelho (VERM) só para perigo, verde (VERDE) para solução, âmbar (AMB) para atenção, ciano e azul para o resto.
- Folha de quadros a cada 1,5 s conferida antes do render: nada sobreposto, nada vazio por mais de 1 s, nenhum texto cortado.

Entrega: página com o vídeo embutido (thread de retenção) e agendamento só com o ok do Diego.
Render: se kit/render.mjs não achar o Chrome, ele tenta sozinho os caminhos de /opt/pw-browsers; dá pra forçar com CHROME=<caminho>.

## Grade fixa (2 vídeos por dia, revisada em 11/10 após a escolha Buffer + Metricool)

| Dia | Horário | Série | O que é |
|---|---|---|---|
| Todos | 12h | Radar IA (a partir de 16/10) | Notícias de IA: lançamentos, comparação de modelos, notícias importantes e preços. Feito pela VIGIA (6h27) no próprio dia, com notícias das últimas 24 a 72 h. Até 15/10 era "Faça com IA". |
| Seg, Qua, Sex | 19h | Agente do zero (a partir de 19/10) | Série "Monte seu agente do zero": ep 1 em 19/10, ep 2 em 21/10, ep 3 em 23/10... |
| Ter, Sáb | 19h | Automação do zero (a partir de 17/10) | Série com o mesmo Make grátis. Ep 1 (17/10, feito no thread de retenção): anexo do Gmail salvo sozinho no Drive; ep 2: formulário vira linha na planilha + e-mail de resposta; ep 3: lembrete no WhatsApp de evento da agenda. |
| Qui | 19h | Termo de IA (a partir de 22/10) | Um termo de negócio em 35 s: RAG, token, embedding, fine-tuning, alucinação, MCP, API, agente x chatbot. Termo explicado entra em canal/glossario.json pra não repetir. |
| Dom | 19h | Modelos e parâmetros (a partir de 18/10) | Nomenclatura e comparação: mini/flash/pro, temperatura, janela de contexto, modelo com raciocínio, aberto x fechado. |
| Sábado | 10h | Carrossel da Semana | Só no Instagram (escolha do Diego em 11/10). DESDE 24/10 (Diego, card de 17/10): visual NEON (mesmas cores e fontes do kit/neon-kit.js), nunca mais Raio-X, e só agenda com o ok do Diego (mandar os slides à sessão de retenção, como os vídeos). Resume o melhor vídeo da semana em 7 a 10 slides, com o prompt no último slide. Primeiro em 17/10, feito na produção de quarta. Teste em 11/10 15h (4 IAs grátis). Como fazer: HTML 1080x1350 em kit/carrossel-*.html (render(i) = slide i), `node kit/render.mjs pagina.html pasta stills 0,1,...`, JPGs em carrosseis/<data-slug>/, Buffer createPost com assets image e metadata.instagram.type post (testado, aceita 8 imagens). 17/10 (fórmula de planilha, 7 slides, kit/carrossel-2026-10-17-formula-planilha.html) foi pelo Metricool com publicação automática e sem música, porque o Buffer grátis estava com o Instagram cheio (10 de 10). |

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
5. Montagem: desde 24/10 no kit neon + kit/neon-entrega.js (ver "Padrão de entrega" acima). Texto antigo, só para referência: kit Raio-X de kit/ (raiox-kit.js + raiox-motion.js, cue() sincroniza com a fala): `node kit/render.mjs kit/NN-slug-raiox.html videos/NN-slug-raiox-final.mp4 kit/audio/NN-slug.wav`.
   - Regras de forma (Diego, 11/10): nada torto nem sobreposto. Câmera não gira, objeto 3D fica em vista fixa (sem rodar), selo reto, troca de forma por encolher e crescer (sem deformar), transição por varredura. Objeto achatado (celular, papel) vai em traço 2D, não em 3D. Antes de renderizar, conferir a folha de quadros a cada 1,5 s: nada cortado na borda, nenhum texto em cima de forma. O título da abertura aparece inteiro no quadro 1 (kinetic faz isso sozinho na cena 0). Depois do render, `python3 canal/capa.py canal/roteiros/X.json` gera a capa (último quadro da abertura); o publicar.py usa o mesmo instante como capa do Instagram.
6. `python3 canal/validar.py canal/roteiros/X.json` (antes da voz, use `--sem-mp4`). Se barrar, corrigir e rodar de novo.
7. MP4 em videos/ do repositório, commit e push.
8. `python3 canal/publicar.py canal/roteiros/X.json`: valida de novo, confere o link raw e agenda no Buffer com rótulo de IA. Se imprimir que o Instagram vai pelo Metricool, agendar com createScheduledPost usando canal/metricool/<id>.json e rodar `--metricool-ok <id> <plannerUrl>`. Se o Buffer recusar, agendar tudo pelo Metricool e anotar aqui.
9. Conferir na agenda real, atualizar este arquivo, a pauta, o registro e a memória. Commit e push.
10. Mensagem curta: tabela Dia | Horário | Vídeo | Série, agendado até quando, comentários a fixar e problemas.

## Grade nova de 19/10/2026 (Diego, 16/10 04h11, thread "Retenção: gancho e ritmo"), ANTECIPADA para 17/10 (Diego, 16/10 04h13)

- Antecipada de novo pelo Diego (16/10 04h47): vale desde HOJE, sex 16/10, e tudo o que estava agendado de 16 a 18/10 sai da agenda. 16/10: 12h Radar IA #1 e 19h Agente do zero ep 1 (os dois feitos pela sessão do thread de retenção, session_01KnRMZcWxFwradJVTTVCgGb). 17/10: 12h Radar IA da vigia; 19h Automação do zero ep 1 (retenção). 18/10: 12h Radar IA da vigia; 19h Modelos e parâmetros #1 (produção). Agente do zero: ep 2 em 19/10, ep 3 em 21/10, ep 4 em 23/10. A Automação do zero do ep 2 em diante é da produção.
- APROVAÇÃO (Diego, 16/10): vídeo novo só é agendado depois do ok do Diego. Pronto o MP4, copiar para /mnt/project-files/videos/ e mandar o caminho, o horário e o tema à sessão do thread de retenção, que mostra ao Diego; agendar (ou `--substituir`) só quando ela avisar o ok. Como o Radar IA sai no mesmo dia, a vigia manda o 12h assim que ficar pronto.

- Detalhes em /mnt/project-files/operacao/grade-2026-10-19.md (ler antes de produzir). Nomes de série no roteiro: "Radar IA", "Agente do zero", "Automação do zero", "Termo de IA", "Modelos e parâmetros" (o validar.py confere dia e horário de cada um e barra "Faça com IA" e "Agente na Prática" de 17/10 em diante).
- 12h Radar IA: 60 s, "formato": "radar-60" (55 a 65 s), com 3 notícias de cerca de 15 s cada (Diego, card de 16/10 05h06). As séries das 19h continuam com 35 s. A VIGIA diária produz o 12h do mesmo dia. A produção de dom/qua/sex não adianta mais o 12h, só o 19h. Se a vigia falhar, o 12h sai com o tema mais quente da semana, com fonte.
  - Estrutura 35 s: 0-3 a notícia mais forte com a data; 3-25 três notícias numeradas (o que é, o que muda pra você, preço ou acesso); 25-31 "qual testar hoje" (grátis ou pago com valor); 31-35 chamada + logo.
  - Fonte oficial (blog ou anúncio da empresa, página de preços, documentação); imprensa grande só de apoio; boato e vazamento não entram. Preço em US$ com a data conferida (R$ se houver oficial). Comparação só com número publicado e nome da fonte. Links das fontes na legenda.
- 19h em rodízio (tabela da grade acima). Séries grátis e que funcionam, um passo real por episódio, nome real de botão; ferramenta paga só dizendo o preço. Termo e parâmetro: 0-3 a pergunta; 3-7 onde você já viu; 7-25 explicação em 3 partes com exemplo do dia a dia; 25-31 quando usar e quanto custa; 31-35 chamada.
- Tudo no formato "completo" de 35 s; neon com trilha até 23/10. Cada vídeo pronto: MP4 em /mnt/project-files/videos/ e caminho para a sessão do thread de retenção.

## Série "Monte seu agente do zero" (19h, a partir de 19/10/2026)

- Decisão do Diego no card de 16/10 ("Série do zero"). Plano, ferramentas, custos e regras em /mnt/project-files/operacao/serie-agente-do-zero.md (ler antes de cada episódio).
- Ep 1 em sex 16/10 19h (grade antecipada); sai às seg, qua e sex (grade de 19/10), na ordem dos 11 episódios: sem pular nem repetir. O que já estava agendado (até 18/10) fica.
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
- Vídeo de agente ou automação sempre nomeia a ferramenta pra montar (ex.: n8n, Make, Zapier), diz quanto custa e mostra os 3 passos de montagem; só mostrar o agente funcionando não basta.
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
| 10/2026 | ~39.300 até 25/10 (948 de teste + 40 vídeos e regravações), de 1 milhão grátis | ~3.600 até 18/10 (cota grátis de 10 mil por dia; sem uso novo) |
