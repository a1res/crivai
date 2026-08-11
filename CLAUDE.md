# CLAUDE.md — Crivai (Gerador de Currículos ATS-Friendly)

Este arquivo é a fonte de contexto permanente para o Claude Code neste repositório. Leia-o por completo antes de iniciar qualquer fase do `TODO.md`.

**Nome do produto:** Crivai
**Repositório:** https://github.com/a1res/crivai
**Site publicado em:** `https://a1res.github.io/crivai/` (GitHub Pages, sem domínio próprio — ver seção 3)

## 1. Missão do produto

Criar um website **gratuito**, publicado no GitHub, acessível a qualquer pessoa, em qualquer lugar, que permita a qualquer trabalhador brasileiro montar um currículo profissional a partir da simples inserção de dados em um formulário guiado — e que, durante o processo, o site **recomende ativamente** melhorias: o que adaptar, o que falta, onde o candidato está pecando, tanto para o olho humano quanto para os sistemas de triagem automatizada (ATS) usados no Brasil.

A experiência de uso precisa ser **extremamente intuitiva**: o usuário vai inserindo blocos de informação (uma experiência, clica em "+ adicionar outra"; uma formação, clica em "+ adicionar outra"; contato, site pessoal, pronomes, nome completo etc.), sem fricção, sem jargão técnico, sem exigir que o usuário entenda o que é um ATS para usar a ferramenta.

O site deve ser **bilíngue**: português (Brasil) e inglês, com um toggle visível de troca de idioma. **O site sempre abre em pt-BR por padrão**, independente do idioma do navegador do usuário — a troca para inglês é uma ação explícita do usuário, não automática. Ver seção 3 para a abordagem técnica de i18n compatível com export estático.

## 2. Fonte de verdade: o Deep Research

Todas as decisões de produto, conteúdo, copywriting de recomendações, regras de validação e arquitetura de template **devem ser rastreáveis ao documento de pesquisa** localizado em:

```
docs/research/Pesquisa_ATS_e_Currículos_Brasil.docx
docs/research/pesquisa-resumo.md   ← versão em markdown, grep-ável, use esta para consulta rápida
```

**Regra de trabalho:** antes de implementar qualquer feature relacionada a regras de formatação, pontuação de currículo, recomendações de conteúdo ou textos de orientação ao usuário, consulte o `pesquisa-resumo.md` (via grep/leitura de seção) e cite mentalmente a seção correspondente. Se uma decisão de produto não estiver coberta pela pesquisa, **pare e pergunte ao humano antes de assumir uma regra nova** — não invente heurísticas de RH sem base.

Seções-chave do documento (por número, ver `pesquisa-resumo.md`):
- **0** — Mapa de ATS brasileiros (Gupy ~60%, Kenoby ~15%, Solides ~10%, Taqe ~8%, InfoJobs/Vagas.com, LinkedIn Recruiter) e como cada um processa currículos
- **3.5** — Formatos estruturais (cronológico reverso = padrão ouro; funcional = evitar; híbrido = recomendado para seniores/transição)
- **4 e 4.5** — Mecânica técnica de parsing (por que colunas/tabelas/ícones quebram a leitura), fontes, bullet points, soft skills
- **5, 6, 7, 7.5** — Estratégias por estágio de carreira (entrada, meio, sênior) e casos especiais (lacunas, transição, PJ, currículo acadêmico)
- **9** — Análise competitiva (Canva, Gupy, InfoJobs, LinkedIn Resume Builder) — usar para saber o que NÃO repetir
- **10** — LGPD (retenção de dados, dados sensíveis, Art. 20 — direito à explicabilidade de decisões automatizadas)
- **11** — Protocolo de validação empírica (auditoria técnica → sandbox ATS → homologação humana)
- **12** — Escopo explícito do MVP (SEM carta de apresentação; SEM integração bidirecional com LinkedIn nesta fase)

## 3. Decisões de arquitetura (já tomadas — não reabrir sem discutir com o humano)

| Decisão | Escolha | Motivo |
|---|---|---|
| Frontend | **Next.js**, com `output: 'export'` (static export) | Permite publicar em GitHub Pages como site 100% estático |
| Hospedagem do frontend | **GitHub Pages, sem domínio próprio.** URL final: `https://a1res.github.io/crivai/` | Gratuito, direto do repositório `github.com/a1res/crivai`, sem custo de registro de domínio |
| Configuração de path | `basePath: '/crivai'` e `assetPrefix: '/crivai'` no `next.config.js` | Necessário porque o site vive num subcaminho (`/crivai`) da URL padrão do GitHub Pages, não na raiz de um domínio próprio |
| Visibilidade do repositório | **Público** | O GitHub Pages gratuito para contas pessoais só publica automaticamente a partir de repositórios públicos; repositórios privados exigem plano pago (GitHub Pro) para publicar Pages. Como o projeto é open/gratuito por natureza, manter público não é um problema |
| Internacionalização (i18n) | Dicionários de tradução estáticos (`pt-BR.json` / `en.json`) + Context/estado no cliente para alternar idioma, **sem** roteamento por subpath de idioma (ex: nada de `/en/`, `/pt/`) | Abordagem mais simples compatível com `output: 'export'` puro. Idioma escolhido é lembrado via `localStorage`; padrão inicial é sempre `pt-BR` |
| Backend de IA | **Cloudflare Workers** (free tier) | Necessário para não expor chave de API de LLM no navegador. O Worker é o único lugar que fala com a API de IA |
| Linguagem | **TypeScript** em todo o projeto (frontend e Worker) | Consistência e segurança de tipos |
| Estilização | Tailwind CSS | Rápido de iterar, fácil manter consistência visual |
| Geração de PDF | Renderização HTML/CSS controlada → exportação para PDF com camada de texto real (nunca PDF-imagem) | Ver restrições da seção 4.5 da pesquisa — PDF sem texto vetorizado = currículo invisível para o ATS |
| Armazenamento de dados do usuário | **Local-first**: dados do currículo ficam no navegador (localStorage/IndexedDB) por padrão. Nenhum dado pessoal é enviado a um servidor além do necessário para a chamada de IA (e, mesmo assim, sem persistência no backend) | Minimiza superfície de exposição a LGPD — não há banco de dados de currículos para vazar |
| Autenticação/contas de usuário | **Fora do escopo do MVP** | Reduz complexidade e superfície de dados pessoais armazenados |

**Sobre não ter domínio próprio:** o produto vive inteiramente na infraestrutura gratuita do GitHub (`a1res.github.io/crivai`). Isso é uma escolha deliberada para não ter nenhum custo recorrente — pode ser revisitado no futuro (comprar um domínio como `crivai.app.br` e apontar via GitHub Pages custom domain) sem exigir reescrever a aplicação, mas essa migração **não faz parte do escopo atual** e não deve ser antecipada em código (ex: não deixar `basePath` hardcoded em lugares que dificultem removê-lo depois).

**Restrição importante do Next.js estático:** com `output: 'export'`, não há API Routes nem Server Actions do Next.js disponíveis em produção (GitHub Pages é estático). Qualquer lógica que precise rodar no servidor (chamadas de IA, validações que exijam segredo) vai obrigatoriamente para o Cloudflare Worker, nunca para dentro do Next.js.

## 4. Restrições técnicas inegociáveis (derivadas da pesquisa — violar isso quebra o produto)

Estas regras vêm diretamente da mecânica de parsing descrita na seção 4.5 e devem ser aplicadas tanto no motor de template quanto no linter de validação (Fase 4/8 do TODO):

1. **Nunca gerar layout em múltiplas colunas, tabelas HTML para estrutura visual, ou caixas de texto flutuantes** no template do currículo. O parser do ATS lê por coordenadas X/Y varrendo a tela; múltiplas colunas embaralham o texto.
2. **Nunca usar ícones gráficos, medidores de proficiência (bolinhas, barras) ou glifos decorativos como portadores de informação.** Eles viram lixo Unicode ou são ignorados.
3. **Nunca gerar um PDF sem camada de texto vetorizado** (nunca renderizar como imagem/screenshot). Isso zera a pontuação do candidato.
4. **Nunca inserir texto invisível, fonte de tamanho zero, texto branco sobre fundo branco, ou qualquer tentativa de manipular a pontuação do ATS via prompt injection.** A pesquisa (seção 4.5) documenta isso como vetor de ataque real e classifica como alto risco — inclusive com risco de banimento do candidato na plataforma. O produto deve ativamente **impedir** essa prática (ex: bloquear cor de fonte igual à cor de fundo, bloquear tamanho de fonte abaixo de um mínimo legível).
5. **Fontes sem serifa, 10–12pt, cores restritas a tons neutros (azul marinho/cinza escuro) em cabeçalhos/links.**
6. **Frases curtas, bullet points como padrão de estrutura de experiência — nunca parágrafos longos.**
7. **Soft skills nunca como lista de adjetivos soltos** — a UI deve orientar o usuário a integrá-las em frases de resultado (ver exemplo na seção 4 da pesquisa).
8. **Formato padrão sugerido: cronológico reverso.** Formato funcional puro deve ser desencorajado ativamente na UI (permitido, mas com aviso), exceto para usuários que a ferramenta identifique como "entrada de carreira pura". Híbrido é a recomendação para perfis sêniores/transição de carreira.

## 5. Privacidade e LGPD por padrão (seção 10 da pesquisa)

- **Campo de foto: ausente por padrão.** Só deve ser oferecido como opção explícita e não recomendada, com um aviso explicando o risco de viés algorítmico — nunca no fluxo principal.
- **Nenhum dado sensível (raça, religião, sindicalização, condição de saúde/PCD) deve ser um campo estruturado do formulário.** Se o usuário quiser mencionar PCD (para vagas com cotas, por exemplo), isso é texto livre dentro de uma seção, nunca um campo categorizado que a ferramenta trata de forma especial.
- **Toda sugestão gerada por IA precisa ser explicável.** Nunca mostrar apenas uma nota/score sem explicar o motivo (isso é exigência do Art. 20 da LGPD, direito à revisão de decisões automatizadas — mesmo sendo o candidato quem usa a ferramenta e não a empresa, é a postura mais segura e também a mais útil ao usuário).
- **Sem retenção perpétua de dados no backend.** Como a arquitetura é local-first, isso é resolvido por padrão — mas qualquer log ou cache temporário no Cloudflare Worker deve ter expiração curta (documentar o TTL no código).

## 6. Convenções de código e fluxo de trabalho com o Claude Code

- **Código em inglês** (nomes de variáveis, funções, componentes, commits). **Todo texto visível ao usuário deve existir nos dois idiomas (pt-BR e en), nunca hardcoded diretamente em um componente** — sempre via dicionário de tradução (ver seção 3). O idioma padrão de abertura do site é sempre **pt-BR**.
- **Uma tarefa por vez, com commit ao final de cada tarefa concluída.** Não acumular múltiplas mudanças não relacionadas num único commit.
- Ao final de **cada fase** do `TODO.md`, gerar um resumo do que foi feito e, se houver, uma seção explícita **"⚠️ AÇÃO HUMANA NECESSÁRIA"** listando exatamente o que o usuário (Aires) precisa fazer manualmente antes de prosseguir para a próxima fase (ex: criar conta na Cloudflare, gerar chave de API, configurar secret no GitHub Actions, testar algo manualmente). Não prosseguir para a fase seguinte assumindo que essas ações já foram feitas — perguntar/confirmar.
- Preferir Plan Mode para fases grandes antes de escrever código.
- Rodar lint/typecheck antes de considerar uma tarefa concluída.

## 7. Modelo de dados do currículo (visão geral)

O formulário é organizado em blocos repetíveis (padrão "+ adicionar outro(a)"):

- **Identificação**: nome completo, pronomes (campo opcional), e-mail, telefone, cidade/UF, LinkedIn, site pessoal/portfólio, GitHub (se aplicável)
- **Resumo/objetivo** (texto curto, opcional mas recomendado para perfis híbridos/sêniores)
- **Experiências profissionais** (repetível): cargo, empresa, período (mês/ano início–fim ou "atual"), local, modalidade (presencial/híbrido/remoto), bullet points de realizações
- **Formação acadêmica** (repetível): instituição, curso, grau, período, status
- **Habilidades técnicas** (repetível, com sugestão de agrupamento por categoria)
- **Idiomas** (repetível): idioma, nível (texto, não medidor gráfico)
- **Projetos/portfólio** (repetível, opcional — relevante para tech/criativos)
- **Certificações** (repetível, opcional)
- **Voluntariado/atividades extracurriculares** (repetível, opcional)

O modelo de dados completo (schema TypeScript) será detalhado na Fase 2 do `TODO.md`. Este documento fixa apenas os campos mínimos esperados pelo usuário.

## 8. Estrutura de pastas esperada do repositório

```
/
├── CLAUDE.md
├── TODO.md
├── README.md
├── docs/
│   └── research/
│       ├── Pesquisa_ATS_e_Currículos_Brasil.docx
│       └── pesquisa-resumo.md
├── src/                      (Next.js app)
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── resume-schema.ts
│   │   ├── ats-rules.ts      (regras de validação derivadas da seção 4.5)
│   │   └── templates/
│   ├── locales/
│   │   ├── pt-BR.json
│   │   └── en.json
│   └── styles/
├── worker/                   (Cloudflare Worker — backend de IA)
│   ├── src/
│   └── wrangler.toml
└── .github/
    └── workflows/
        └── deploy.yml
```

## 9. O que está fora de escopo no MVP (não implementar sem revisitar com o humano)

- Carta de apresentação / cover letter (seção 12 da pesquisa — sem cultura de uso no Brasil)
- Integração bidirecional com LinkedIn (ler/escrever perfil)
- Contas de usuário / login / persistência em banco de dados
- Modelo de monetização/freemium (seção 13 — é uma perspectiva futura, não uma tarefa deste TODO)
