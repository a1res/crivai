# Crivai — pasta inicial do projeto

Repositório: **https://github.com/a1res/crivai**
Site: **https://a1res.github.io/crivai/** (ao vivo após a Fase 10 do `TODO.md`, gratuito, sem domínio próprio)

Esta pasta é o ponto de partida para desenvolver o projeto com o Claude Code.

## Como usar

1. Copie o conteúdo desta pasta para o diretório onde você vai versionar o projeto (ou já inicialize o `git init` aqui mesmo).
2. Abra o Claude Code nesta pasta.
3. Peça para o Claude Code ler o `CLAUDE.md` e o `TODO.md` e começar pela **Fase 0**.
4. Siga uma fase de cada vez. Ao final de cada fase, o Claude Code vai indicar se há alguma ação manual sua necessária (ex: criar conta em algum serviço, gerar chave de API, revisar algo visualmente) antes de seguir para a próxima.

## O que está aqui

- `CLAUDE.md` — contexto permanente do projeto: missão, decisões de arquitetura, restrições técnicas obrigatórias (derivadas da pesquisa), convenções de código.
- `TODO.md` — plano de execução em 12 fases (0 a 11), da fundação do repositório até o pós-lançamento.
- `docs/research/` — o Deep Research original que fundamenta todas as decisões de produto:
  - `Pesquisa_ATS_e_Currículos_Brasil.docx` — documento original
  - `pesquisa-resumo.md` — mesma pesquisa convertida para markdown, para o Claude Code conseguir consultar/grep-ar rapidamente durante o desenvolvimento

## Decisões já tomadas (resumo)

- Nome: **Crivai** — publicado gratuitamente em `a1res.github.io/crivai`, **sem domínio próprio** (para não ter custo de registro)
- Frontend: Next.js (export estático) → GitHub Pages, com `basePath: '/crivai'` (repositório precisa ser público para o Pages funcionar de graça)
- Idioma: site bilíngue (pt-BR / en) com toggle no header; **abre em pt-BR por padrão**
- Backend de IA: Cloudflare Worker (protege a chave de API)
- Dados do usuário: local-first (ficam no navegador, não em um banco de dados)
- Escopo: Brasil, sem carta de apresentação, sem contas de usuário no MVP

Detalhes completos em `CLAUDE.md`.
