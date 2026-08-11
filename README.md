# Crivai

Gerador de currículos **gratuito**, feito para o mercado brasileiro, que monta um
currículo a partir de um formulário guiado e recomenda ativamente o que melhorar — tanto
para o recrutador humano quanto para os sistemas de triagem automatizada (ATS) usados no
Brasil.

**Site:** https://a1res.github.io/crivai/ (no ar a partir da Fase 10)

> **Status:** Fase 0 concluída — fundação do repositório, build e deploy. A interface do
> produto ainda não existe; ver `TODO.md` para o plano completo em 12 fases.

## Como funciona, em uma frase

O currículo é montado no navegador, renderizado em coluna única sem tabelas nem ícones
decorativos, e exportado em PDF com camada de texto real — porque um PDF sem texto
vetorizado retorna vazio para o ATS e zera a pontuação do candidato.

## Stack

| Camada           | Escolha                                                               |
| ---------------- | --------------------------------------------------------------------- |
| Frontend         | Next.js 16 (App Router) com `output: 'export'` — site 100% estático   |
| Estilo           | Tailwind CSS v4 (configuração via `@theme` em CSS, não em arquivo JS) |
| Linguagem        | TypeScript em todo o projeto                                          |
| Hospedagem       | GitHub Pages, sem domínio próprio, publicado em `/crivai`             |
| Backend de IA    | Cloudflare Worker (mantém a chave de API fora do navegador)           |
| Dados do usuário | Local-first — ficam no navegador, não há banco de dados               |

Com export estático **não existem API Routes nem Server Actions em produção**. Qualquer
coisa que precise de servidor ou de um segredo vai para o Worker.

## Rodando localmente

Requer **Node.js 20.9+** (o projeto é desenvolvido e testado no 24).

```bash
npm install
npm run dev
```

Abra **http://localhost:3000/crivai** — não a raiz.

O `basePath` fica ativo também em desenvolvimento, de propósito: o site em produção vive
no subcaminho `/crivai`, e manter o ambiente local idêntico faz um caminho errado quebrar
já no localhost em vez de falhar silenciosamente só depois do deploy. A raiz
(`http://localhost:3000`) responder 404 é o comportamento esperado.

### Scripts

| Comando                           | O que faz                                    |
| --------------------------------- | -------------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento                  |
| `npm run build`                   | Build de produção → gera `out/`              |
| `npm run check`                   | Typecheck + lint + verificação de formatação |
| `npm run typecheck`               | Gera os tipos do Next e roda o compilador    |
| `npm run lint` / `lint:fix`       | ESLint                                       |
| `npm run format` / `format:check` | Prettier                                     |
| `npm run check:locales`           | Dicionários pt-BR/en alinhados               |

Rode `npm run check` antes de considerar qualquer tarefa concluída — é o mesmo comando
que roda no CI e que bloqueia o deploy em caso de falha.

### Textos e idiomas

Nenhum texto visível ao usuário fica hardcoded em componente: tudo passa por `t()`, lendo
de [src/locales/](src/locales/). Duas redes de proteção impedem que um idioma fique para
trás — o TypeScript derruba o build se uma chave existir num dicionário e faltar no outro,
e `check:locales` pega valores vazios e placeholders divergentes (ex.: `{done}` em
português contra `{count}` em inglês, que falharia em silêncio só no idioma não testado).

### Guia de estilo

`/style-guide` mostra todos os componentes base em seus estados, para revisão visual sem
precisar rodar nada. É uma página interna e será removida antes do lançamento.

## O Worker de IA

Fica em [worker/](worker/), como um pacote separado com as próprias dependências.

```bash
cd worker
npm install
npm run dev        # sobe em http://127.0.0.1:8787
curl http://127.0.0.1:8787/health
```

Deploy (exige `wrangler login` e uma conta Cloudflare):

```bash
cd worker
npm run deploy
```

A chave da API do modelo de linguagem **nunca é commitada** — ela é definida como secret:

```bash
wrangler secret put LLM_API_KEY
```

O CORS aceita apenas `https://a1res.github.io` e `http://localhost:3000`, com a origem
ecoada de volta em vez de `*`, porque as fases seguintes enviam dados de currículo para
esse endpoint.

## Deploy

O site é publicado automaticamente a cada push na `main` por
[.github/workflows/deploy.yml](.github/workflows/deploy.yml): o workflow roda
`npm ci` → `npm run check` → `npm run build` e publica `out/` via a action oficial do
GitHub Pages. Um `check` que falha interrompe o deploy.

Para isso funcionar, o repositório precisa estar **público** e o Pages configurado em
_Settings → Pages → Source: **GitHub Actions**_ (não "Deploy from a branch").

O Worker **não** é publicado por esse workflow — o deploy dele é manual, via `wrangler`.

## Estrutura

```
src/app/          rotas e layout (App Router)
src/components/   componentes de UI          (Fase 1)
src/lib/          schema, regras de ATS, templates de currículo (Fases 2–4)
src/locales/      dicionários pt-BR / en     (Fase 1)
src/styles/       CSS global
worker/           Cloudflare Worker (backend de IA)
docs/research/    a pesquisa que fundamenta as decisões de produto
```

## Documentação do projeto

- **[CLAUDE.md](CLAUDE.md)** — missão, decisões de arquitetura, restrições técnicas
  inegociáveis e convenções de código. Leia antes de mexer em qualquer coisa.
- **[TODO.md](TODO.md)** — plano de execução em fases, da fundação ao lançamento.
- **[docs/research/](docs/research/)** — o Deep Research sobre ATS e currículos no Brasil,
  fonte de verdade de toda decisão de produto. Use `pesquisa-resumo.md` para consulta
  rápida; o `.docx` original é versionado direto no Git, **sem Git LFS** (≈3 MB não
  justifica a complexidade extra).

## Privacidade

Os dados do currículo ficam no navegador do usuário. Não há contas, não há banco de dados
e não há retenção no backend — o Worker recebe o conteúdo apenas para gerar sugestões e
não persiste nada. Não existe campo estruturado para dado sensível, e o campo de foto está
ausente do fluxo principal por decisão de projeto, por causa do risco de viés algorítmico.

## Licença

Ainda não definida.
