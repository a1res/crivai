# TODO.md — Plano de Execução em Fases

> Leia o `CLAUDE.md` inteiro antes de começar. Cada fase abaixo deve ser executada **uma de cada vez**, nesta ordem, com commits granulares dentro dela. Ao final de cada fase, produza um resumo do que foi feito e, se aplicável, uma seção **"⚠️ AÇÃO HUMANA NECESSÁRIA"**. Não inicie a fase seguinte sem confirmação do humano de que as ações pendentes foram resolvidas.

---

## Fase 0 — Fundação do repositório e ambiente

**Objetivo:** ter um repositório funcional, com Next.js rodando em modo de exportação estática, deploy automatizado para GitHub Pages, e o esqueleto do Cloudflare Worker, antes de qualquer feature de produto.

### Tarefas
1. Inicializar repositório Git (o repositório já existe em `https://github.com/a1res/crivai` — conectar o remote local a ele) e estrutura de pastas conforme seção 8 do `CLAUDE.md`.
2. Criar projeto Next.js (TypeScript, App Router, Tailwind) configurado com `output: 'export'`, `images.unoptimized: true` (obrigatório para export estático), **e `basePath: '/crivai'` + `assetPrefix: '/crivai'`** — o site será publicado em `https://a1res.github.io/crivai/`, um subcaminho, não a raiz de um domínio próprio. Sem esses dois campos configurados, todos os links, imagens e assets quebram em produção (funcionam localmente e falham silenciosamente só depois do deploy).
3. Configurar ESLint + Prettier + tsconfig estrito (`strict: true`).
4. Criar `.github/workflows/deploy.yml`: build do Next.js → publica a pasta `out/` via a action oficial do GitHub Pages (`actions/deploy-pages`) a cada push na branch principal. Não é necessário nenhum arquivo `CNAME` (não há domínio próprio nesta fase do projeto).
5. Criar esqueleto do Cloudflare Worker em `worker/` com `wrangler.toml` básico, um endpoint de health-check (`/health`) e CORS configurado para aceitar apenas `https://a1res.github.io` (e, se útil durante o desenvolvimento, `http://localhost:3000`).
6. Criar `README.md` na raiz explicando o projeto, como rodar localmente (`npm run dev`), e como fazer deploy.
7. Copiar/confirmar que `docs/research/` está presente e versionado no Git (o `.docx` pode ir para Git LFS se o time preferir — decidir e documentar no README).
8. Primeiro commit: "chore: project scaffolding".

### ⚠️ Ação humana necessária (esperada ao final desta fase)
- **Confirmar que o repositório `a1res/crivai` está com visibilidade Público.** O GitHub Pages gratuito em contas pessoais só publica automaticamente a partir de repositórios públicos — repositório privado exige upgrade pago (é provavelmente a causa do "não consigo mexer no Pages" mencionado antes). Configurações → General → Danger Zone → Change visibility, se estiver privado.
- Habilitar GitHub Pages nas configurações do repositório (Settings → Pages → Source: **GitHub Actions**, não branch).
- Criar conta na Cloudflare (se ainda não tiver) e rodar `wrangler login` localmente para autenticar.
- Confirmar CORS no Worker (Fase 0, tarefa 5) contra a origem final `https://a1res.github.io`.
- Depois do primeiro deploy, testar `https://a1res.github.io/crivai/` diretamente e confirmar que carrega sem erro 404 e sem assets quebrados (CSS/imagens) — esse é o teste mais comum de falhar quando `basePath` está mal configurado.

---

## Fase 1 — Sistema de design e componentes de UI base

**Objetivo:** ter a linguagem visual e os componentes reutilizáveis prontos antes de construir o formulário, para manter consistência — incluindo a infraestrutura de idioma (pt-BR/en), já que todo texto de UI daqui pra frente depende disso.

### Tarefas
1. Definir paleta de cores, tipografia e espaçamento no Tailwind config (algo neutro, profissional, confiável — evitar parecer um site "genérico de IA").
2. Construir componentes base: `Button`, `Input`, `TextArea`, `Select`, `DatePicker` (mês/ano), `Card`, `Tooltip`, `Badge`, `ProgressIndicator` (para mostrar progresso no formulário).
3. Construir o componente central de UX do produto: **bloco repetível** (`RepeatableSection`) — um cartão com os campos de um item (ex: uma experiência), botão "Remover" e, fora dele, botão "+ Adicionar outra experiência". Deve suportar reordenação (drag-and-drop ou botões subir/descer) já que a ordem das experiências importa para o currículo.
4. Construir um layout de página com navegação lateral ou por etapas (steps: Identificação → Resumo → Experiências → Formação → Habilidades → Idiomas → Extras → Revisão) — decidir entre "tudo em uma página com scroll" vs. "wizard por etapas" e documentar a decisão. Recomendação: uma página só com seções ancoradas + indicador de progresso, para não fragmentar a experiência de quem quer ver o currículo tomando forma em tempo real (ver Fase 3, preview ao vivo).
5. **Implementar a infraestrutura de internacionalização (i18n):**
   - Criar `src/locales/pt-BR.json` e `src/locales/en.json` com a mesma estrutura de chaves.
   - Criar um `LocaleContext`/hook (`useTranslation` ou similar) que lê o dicionário certo e expõe uma função de tradução (`t('chave')`) para os componentes.
   - Persistir a escolha de idioma em `localStorage`; **na ausência de valor salvo, o padrão é sempre `pt-BR`**, mesmo que o navegador esteja em outro idioma.
   - Construir o componente de **toggle de idioma** (ex: "PT | EN" ou seletor com bandeiras/siglas) e posicioná-lo em um lugar fixo e visível do layout (ex: canto superior direito do header).
   - Todos os componentes base construídos nesta fase (botões, labels, mensagens de erro, etc.) já devem consumir texto via `t()`, nunca string hardcoded — isso evita ter que caçar strings soltas depois, quando o formulário inteiro já estiver construído.
6. Testes visuais manuais (screenshot ou Storybook, à escolha) dos componentes base, incluindo o toggle de idioma alternando corretamente.

### ⚠️ Ação humana necessária
- Revisar visualmente a paleta/tipografia proposta e aprovar ou pedir ajuste antes de seguir para a Fase 2 (a partir daqui tudo vai usar esse sistema de design).
- Confirmar que o toggle de idioma está num lugar intuitivo e que a troca de idioma é instantânea (sem reload da página) antes de seguir — esse padrão vai se repetir em todo o resto do site.

---

## Fase 2 — Modelo de dados do currículo e formulário funcional

**Objetivo:** o usuário consegue preencher todos os dados do currículo, com autosave local, sem nenhuma feature de IA ainda.

**Nota sobre idioma:** o toggle pt-BR/en da Fase 1 controla apenas o **idioma da interface** (labels, botões, instruções do site). O **conteúdo que o usuário digita no currículo** (cargo, descrições, resumo etc.) é escrito no idioma que o próprio usuário escolher digitar, sem nenhuma tradução automática do conteúdo — o produto não deve tentar traduzir o currículo da pessoa, só a própria interface do site.

### Tarefas
1. Definir o schema TypeScript completo do currículo em `src/lib/resume-schema.ts` (usar Zod para validação em runtime), cobrindo todos os campos listados na seção 7 do `CLAUDE.md`, incluindo campos para os casos especiais da seção 7.5 da pesquisa (ex: campo opcional de "lacuna explicada", flag de "PJ/autônomo" numa experiência, flag de currículo acadêmico).
2. Implementar o estado global do formulário (Context API, Zustand, ou similar — escolher o mais simples possível dado que não há necessidade de nada pesado).
3. Implementar autosave em `localStorage` (debounced) e recuperação automática ao reabrir o site ("Continuar de onde parei").
4. Implementar botão explícito de "Limpar todos os dados" (importante para LGPD/confiança do usuário — deixar claro que ele controla os dados).
5. Construir cada seção do formulário usando os componentes da Fase 1:
   - Identificação (nome, pronomes, contato, links)
   - Resumo/objetivo
   - Experiências (repetível, com toggle "emprego atual" que desabilita data de fim)
   - Formação (repetível)
   - Habilidades técnicas (repetível, com agrupamento por categoria opcional)
   - Idiomas (repetível, nível como texto/select, nunca medidor gráfico — conforme restrição da seção 4.5 da pesquisa)
   - Projetos/portfólio (repetível, opcional)
   - Certificações (repetível, opcional)
   - Voluntariado/extracurricular (repetível, opcional)
6. Validação de formulário com mensagens de erro amigáveis em pt-BR.
7. Implementar exportação/importação dos dados em JSON puro (permite ao usuário fazer backup manual do próprio currículo — reforça o modelo local-first).

### ⚠️ Ação humana necessária
- Testar o preenchimento completo do formulário manualmente e reportar qualquer campo que pareça confuso ou fora de ordem antes de seguir para a Fase 3 (nessa fase o fluxo de entrada de dados fica "congelado" como base para o resto do produto).

---

## Fase 3 — Motor de templates e preview em tempo real

**Objetivo:** os dados preenchidos viram um currículo visualmente pronto, renderizado ao vivo, seguindo as restrições técnicas inegociáveis da seção 4 do `CLAUDE.md`.

### Tarefas
1. Construir o motor de renderização de template em `src/lib/templates/` — **coluna única, sem tabelas de layout, sem ícones portadores de informação**, hierarquia de texto padrão (H1 nome, H2 seções, texto corrido para bullets).
2. Implementar pelo menos **2 templates visuais** que sigam as mesmas regras estruturais (podem variar em tipografia/espaçamento/cor de destaque, nunca em estrutura de colunas/tabelas).
3. Implementar preview ao vivo: conforme o usuário digita no formulário (Fase 2), o preview do currículo atualiza (split-screen em desktop; alternância formulário/preview em mobile).
4. Implementar exportação para PDF **com camada de texto real vetorizada** (nunca renderizar como imagem). Investigar e escolher a abordagem técnica (ex: geração de PDF a partir de HTML/CSS preservando texto selecionável — validar que a biblioteca escolhida não "achata" o texto em curvas/imagem, problema que a pesquisa aponta como causa da falha do Canva na seção 9).
5. Aplicar as regras de fonte/cor/tamanho da seção 4 do `CLAUDE.md` como padrão fixo do template (não editável livremente pelo usuário — isso é intencional, é a proteção do usuário contra si mesmo).
6. Testar a exportação de PDF abrindo o arquivo e conferindo que o texto é selecionável e copiável (teste manual: selecionar todo o texto do PDF gerado e colar em um editor de texto puro — o resultado deve ser fiel e na ordem correta).

### ⚠️ Ação humana necessária
- Abrir os PDFs gerados pelos 2 templates e confirmar visualmente que estão com boa aparência E confirmar que o texto é selecionável/copiável corretamente antes de seguir para a Fase 4 (a Fase 4 depende de PDFs bem formados para validar programaticamente).

---

## Fase 4 — Motor de validação ATS (regras, sem IA ainda)

**Objetivo:** o produto consegue apontar, de forma determinística e sem custo de IA, problemas estruturais e de conteúdo no currículo — a "primeira camada" de recomendações.

### Tarefas
1. Criar `src/lib/ats-rules.ts` com um conjunto de regras verificáveis programaticamente, cobrindo pelo menos:
   - Seções obrigatórias ausentes (ex: sem nenhuma experiência e sem formação)
   - Bullet points muito longos (contagem de caracteres/palavras acima de um limiar)
   - Frases de experiência sem verbo de ação no início
   - Soft skills listadas como adjetivos soltos (detecção simples por palavra-chave em lista curta, ex: "proatividade", "resiliência" isoladas sem contexto de frase)
   - Datas ausentes ou fora de ordem cronológica
   - Ausência de resumo/objetivo em perfis sênior (regra ligada à Fase 6, estágio de carreira)
   - Uso de campo de foto (se implementado como opção) — gerar aviso de risco de viés (seção 10 da pesquisa)
2. Implementar um painel de "Checklist de Saúde do Currículo" na UI, ao lado do preview, mostrando: ✅ o que está bom, ⚠️ o que pode melhorar, ❌ o que está crítico — cada item com uma explicação curta em pt-BR de *por que* aquilo importa (nunca só apontar o problema sem explicar).
3. Cada item do checklist deve linkar/destacar o campo correspondente no formulário (clicar no aviso leva direto ao campo problemático).
4. Escrever testes unitários para as regras de `ats-rules.ts` com casos de currículo bons e ruins conhecidos.

### ⚠️ Ação humana necessária
- Nenhuma ação externa obrigatória, mas recomenda-se revisar o texto das explicações de cada regra (tom, clareza) antes de seguir para a Fase 5, pois a Fase 6 vai reaproveitar esse mesmo padrão de comunicação para recomendações mais avançadas.

---

## Fase 5 — Backend de IA (Cloudflare Worker) e recomendações avançadas

**Objetivo:** adicionar a camada de recomendações que exige um modelo de linguagem — reescrita de bullet points, análise de aderência a uma vaga específica, sugestões de palavras-chave — mantendo a chave de API protegida no Worker.

### Tarefas
1. Implementar o endpoint principal do Worker (ex: `POST /analyze`) que recebe o JSON do currículo (e opcionalmente uma descrição de vaga colada pelo usuário) e retorna sugestões estruturadas.
2. Implementar rate limiting básico no Worker (por IP ou por sessão) para não estourar custo de API — mesmo sendo "gratuito" para o usuário, a chamada de IA tem custo real para quem hospeda.
3. Implementar sanitização rigorosa da entrada antes de mandar para o modelo de IA: **nunca repassar a descrição de vaga colada pelo usuário (ou o currículo) sem tratamento como texto confiável** — tratar como dado, não como instrução, para não ser vítima do mesmo tipo de ataque de prompt injection descrito na seção 4.5 da pesquisa (um usuário mal-intencionado pode tentar manipular o próprio motor de recomendações da ferramenta).
4. Prompt do modelo deve gerar saída **estruturada (JSON)** com, no mínimo: sugestão, motivo/explicação (obrigatório — requisito de explicabilidade da seção 10/LGPD Art. 20), e o campo/seção a que se refere.
5. Feature: **análise de aderência a uma vaga específica** — usuário cola a descrição da vaga, o sistema compara com o currículo e sugere quais palavras-chave/skills estão faltando (sem inventar experiência que o usuário não tem — a IA nunca deve sugerir adicionar algo falso ao currículo, apenas reformular o que já existe ou apontar lacunas reais).
6. Feature: reescrita assistida de bullet points fracos identificados na Fase 4 (transformar frase fraca em frase com verbo de ação + resultado quantificável, quando possível, com o usuário confirmando/editando antes de aceitar — nunca substituir automaticamente sem revisão).
7. Integrar a resposta do Worker na UI, ao lado do checklist da Fase 4, deixando claro visualmente o que é "regra automática determinística" vs. "sugestão gerada por IA".
8. Implementar tratamento de erro gracioso (Worker fora do ar, rate limit atingido, IA sem resposta) — o produto **nunca pode travar** por causa da camada de IA; o formulário e a exportação de PDF devem funcionar 100% mesmo sem IA disponível.

### ⚠️ Ação humana necessária
- Escolher o provedor de LLM (ex: Anthropic API, OpenAI, ou outro) e gerar a chave de API.
- Configurar a chave como secret no Cloudflare Worker (`wrangler secret put`), nunca commitada no repositório.
- Definir e confirmar um limite de orçamento mensal aceitável para a API de IA antes de publicar o site publicamente (isso protege contra custo inesperado de uso público).
- Testar manualmente o endpoint `/analyze` com um currículo real antes de integrar na UI.

---

## Fase 6 — Estratégias por estágio de maturidade de carreira

**Objetivo:** o produto se adapta ao estágio de carreira do usuário (entrada, meio, sênior), conforme seções 5, 6, 7 e 8 da pesquisa.

### Tarefas
1. Adicionar um campo (implícito ou explícito) de "estágio de carreira" — pode ser inferido automaticamente pela quantidade/duração de experiências preenchidas, ou perguntado diretamente no início do formulário (decidir e documentar a escolha; recomenda-se inferir automaticamente para não adicionar fricção, com opção de o usuário corrigir manualmente).
2. Ajustar as recomendações da Fase 4 e Fase 5 para variar conforme o estágio: ex. para "entrada de carreira", incentivar destacar projetos acadêmicos/extracurriculares e permitir formato funcional com ressalva; para "sênior", cobrar resumo executivo e métricas de resultado, sugerir formato híbrido.
3. Implementar textos de orientação contextual (tooltips/hints) que mudam de acordo com o estágio detectado.
4. Cobrir os casos especiais da seção 7.5 da pesquisa: lacuna de carreira (campo de nota explicativa opcional numa lacuna entre experiências), transição de carreira (destaque de skills transferíveis), freelancer/PJ (flag por experiência), currículo acadêmico (seção extra opcional de publicações).

### ⚠️ Ação humana necessária
- Nenhuma ação externa obrigatória. Recomenda-se testar o fluxo com 3 perfis fictícios (um de cada estágio) antes de seguir para a Fase 7.

---

## Fase 7 — Camada de privacidade, LGPD e confiança do usuário

**Objetivo:** tornar explícitas e visíveis as práticas de proteção de dados já embutidas na arquitetura (seção 10 da pesquisa), e fechar quaisquer lacunas de conformidade.

### Tarefas
1. Escrever uma página "Privacidade" em linguagem simples (não juridiquês) explicando: os dados ficam no seu navegador, o que é enviado ao Worker (apenas para gerar sugestões, sem persistência), e como apagar tudo.
2. Implementar aviso claro (banner discreto, não intrusivo) na primeira visita explicando o modelo local-first, sem exigir "aceitar cookies" desnecessário (o produto deve evitar coletar o que não precisa, reduzindo a necessidade de banners).
3. Confirmar que nenhum campo de dado sensível (raça, religião, sindicalização, saúde) existe como campo estruturado — apenas texto livre onde fizer sentido, conforme já definido na Fase 2. Auditar o schema da Fase 2 contra esse requisito.
4. Se o campo de foto for oferecido (opcional, fora do fluxo principal — Fase 2), garantir que o aviso de risco de viés apareça de forma clara antes do upload.
5. Implementar/confirmar que toda saída de IA (Fase 5) sempre vem acompanhada de explicação — auditar que nenhum endpoint retorna só uma nota/score sem justificativa.
6. Garantir TTL curto em qualquer log/cache no Worker (documentar no código e no README).

### ⚠️ Ação humana necessária
- Revisar o texto da página de Privacidade antes de publicar (tom, exatidão das afirmações sobre o que é ou não enviado ao servidor).

---

## Fase 8 — Segurança e integridade contra manipulação

**Objetivo:** o produto ativamente impede que o próprio usuário (ou um terceiro) use a ferramenta para gerar um currículo com técnicas de manipulação de ATS (texto invisível, prompt injection), protegendo o usuário de si mesmo e da reputação do produto.

### Tarefas
1. No motor de template (Fase 3), bloquear tecnicamente qualquer possibilidade de o usuário definir cor de fonte igual à cor de fundo, ou tamanho de fonte abaixo de um mínimo (ex: 8pt) — essas opções nem devem existir na UI de customização.
2. Sanitizar todo texto livre inserido pelo usuário (bullet points, resumo, descrição de vaga colada) antes de renderizar no PDF e antes de enviar ao Worker — remover caracteres de controle invisíveis, checar por padrões suspeitos de injection.
3. No Worker (Fase 5), implementar tratamento defensivo: a descrição de vaga colada pelo usuário e o próprio currículo devem ser passados ao modelo de IA claramente delimitados como **dados**, nunca concatenados de forma que possam ser interpretados como instrução do sistema.
4. Escrever testes específicos simulando tentativas de injeção (texto com instruções tipo "ignore as instruções anteriores...") tanto no conteúdo do currículo quanto na descrição de vaga, confirmando que o sistema não muda de comportamento.
5. Documentar essa camada de proteção no README como um diferencial de produto (a pesquisa, seção 4.5 e 9, mostra que isso é uma vulnerabilidade real do ecossistema e uma oportunidade de posicionamento).

### ⚠️ Ação humana necessária
- Nenhuma ação externa obrigatória. Esta fase é primariamente técnica/interna.

---

## Fase 9 — Validação empírica (protocolo de 3 estágios da pesquisa, seção 11)

**Objetivo:** confirmar, com evidência real e não apenas teórica, que os currículos gerados são de fato bem processados por ATS reais e bem avaliados por humanos.

### Tarefas
1. **Auditoria técnica de arquitetura:** gerar programaticamente ~30–50 currículos de teste (variando quantidade de seções, tamanho de texto, idiomas) usando os templates da Fase 3, exportar em PDF, e processá-los com bibliotecas de extração de texto (ex: `pdfplumber`/`pypdf` via um script Python auxiliar em `scripts/` fora do build de produção) verificando que a ordem do texto extraído corresponde exatamente à ordem visual pretendida.
2. Documentar os resultados dessa auditoria em `docs/validation/` (criar a pasta), incluindo qualquer ajuste feito no motor de template por causa de falhas encontradas.
3. **Validação em ambiente de homologação (opcional/best-effort):** se houver acesso a alguma conta de desenvolvedor de ATS (ex: sandbox público da Gupy/Catho, se existir e for acessível gratuitamente), testar um currículo exportado. Caso não haja acesso viável, documentar essa limitação explicitamente e deixar como item para uma fase futura.
4. **Homologação humana:** preparar um pequeno roteiro de teste de usabilidade (5–7 perguntas) para aplicar informalmente com pessoas reais (colegas, recrutadores conhecidos, se houver) sobre a clareza do currículo gerado e a utilidade das recomendações.

### ⚠️ Ação humana necessária
- Rodar/participar da etapa de homologação humana (esta etapa depende de pessoas reais e não pode ser automatizada pelo Claude Code).
- Se houver acesso a algum ambiente de teste de ATS real, decidir se vale a pena investir tempo nessa validação antes do lançamento público ou tratá-la como pós-lançamento.

---

## Fase 10 — Publicação e lançamento público

**Objetivo:** o site está no ar, acessível publicamente, com o pipeline de CI/CD validado ponta a ponta.

### Tarefas
1. Revisar SEO básico (meta tags, título "Crivai", descrição, favicon, OG image, `sitemap.xml`, `robots.txt`) — importante mesmo sendo ferramenta gratuita, para ser descoberta organicamente. Atenção: com `basePath: '/crivai'`, os caminhos absolutos de meta tags/OG image precisam incluir o subcaminho.
2. Revisar responsividade completa (mobile, tablet, desktop) — o formulário e o preview precisam funcionar bem em tela pequena. Revisar também o toggle de idioma em mobile (não pode ficar escondido/cortado).
3. Testar o fluxo completo em produção, direto em `https://a1res.github.io/crivai/` (não apenas localmente): preencher currículo → alternar idioma → ver recomendações → exportar PDF → conferir que o Worker de IA responde em produção sem erro de CORS.
4. Confirmar que o HTTPS do GitHub Pages está ativo (é automático para `github.io`, sem nenhuma ação extra necessária — diferente de um domínio próprio).
5. Escrever/atualizar o `README.md` com instruções finais, o link `https://a1res.github.io/crivai/`, e capturas de tela.
6. Criar uma checklist final de lançamento (ex: analytics básico e respeitoso de privacidade — opcional; página de erro 404 customizada dentro do subcaminho `/crivai`; teste em pelo menos 2 navegadores diferentes).

### ⚠️ Ação humana necessária
- Confirmar que `https://a1res.github.io/crivai/` está no ar e navegável de ponta a ponta (Settings → Pages do repositório mostra o link e o status do último deploy).
- Fazer uma revisão final manual do site inteiro antes de divulgar (ex: compartilhar com 2-3 pessoas de confiança antes de tornar público de fato).
- Decidir se/quando divulgar o link publicamente (LinkedIn, redes, etc.) — isso é decisão do usuário, não do Claude Code.
- (Opcional, futuro) Se decidir comprar um domínio próprio mais adiante, isso é uma mudança pequena e isolada: configurar "Custom domain" no GitHub Pages + adicionar `CNAME` no build + apontar DNS. Não precisa reabrir esta fase para isso.

---

## Fase 11 — Pós-lançamento (backlog futuro, não iniciar sem decisão explícita)

Itens intencionalmente fora do escopo das Fases 0–10, registrados aqui para não serem esquecidos nem confundidos com o MVP:

- Modelo de sustentabilidade freemium (seção 13 da pesquisa) — funcionalidades avançadas de IA (RAG cruzando vaga real, adequação sintática anti-viés em nível corporativo) como possível camada paga futura, **se e quando o custo de infraestrutura justificar**.
- Integração bidirecional com LinkedIn.
- Carta de apresentação (cover letter) — caso o usuário decida que há demanda real futura.
- Contas de usuário / sincronização entre dispositivos.
- Expansão de escopo geográfico para fora do Brasil.

Não iniciar qualquer item desta fase sem o usuário explicitamente pedir para reabrir o escopo.
