# Frontend

Aplicação web do Book Tattoo: landing page pública (equipe de artistas, galeria, como funciona), autenticação e painel do tatuador.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **NextAuth v5** — login com email/senha, GitHub e Google
- **TanStack Query** e **TanStack Table**
- **react-hook-form** + **zod** para formulários
- **Tailwind CSS 4** + **shadcn/ui** (Base UI)
- **axios** para falar com o API gateway
- **Biome** (lint/format) e **bun test** (testes unitários)

## Como rodar

Pré-requisito: backend de pé (Kong em `http://localhost:8000`). Veja o [README da raiz](../README.md).

```bash
cp .env.example .env   # preencha AUTH_SECRET e as credenciais OAuth
bun install
bun dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `AUTH_SECRET` | Segredo do NextAuth (gere com `bunx auth secret`) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | OAuth app do GitHub |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth client do Google |
| `API_URL` | URL do API gateway (Kong). Padrão: `http://localhost:8000` |
| `INTERNAL_API_SECRET` | Mesmo valor do user-service. Enviado no header `X-Internal-Secret` ao vincular contas OAuth |

## Scripts

| Comando | O que faz |
|---|---|
| `bun dev` | Servidor de desenvolvimento |
| `bun run build` / `bun start` | Build e servidor de produção |
| `bun run lint` | Biome check |
| `bun run format` | Biome format |
| `bun run test` | Testes unitários (`tests/unit`) |

## Estrutura

```
src/
  app/
    (public)/               # landing, login/cadastro, forgot/reset password
    (panel)/dashboard/      # painel autenticado: perfil, serviços, planos
    api/auth/[...nextauth]/ # handlers do NextAuth
  components/               # componentes compartilhados (ui/ = shadcn)
  lib/                      # auth (NextAuth), cliente axios, helpers de sessão
  hooks/
  utils/                    # formatadores (telefone, serviço)
  proxy.ts                  # protege /dashboard/* (redireciona sem sessão)
tests/unit/                 # espelha a estrutura de src/
```

Cada rota segue a convenção:

- `_components/` — componentes da página
- `_actions/` — server actions (mutations)
- `_data_access/` — leituras server-side

## Autenticação

O NextAuth usa estratégia `jwt`. No login por credenciais ele chama `POST /auth/login`; no login social chama `POST /auth/oauth/upsert` no user-service. O `accessToken` e o `refreshToken` retornados ficam no token do NextAuth e são enviados como `Bearer` nas chamadas autenticadas ao gateway (ver [src/lib/get-access-token.ts](src/lib/get-access-token.ts)).

Todas as requisições passam pelo Kong ([src/lib/api.ts](src/lib/api.ts)); o front não conhece a porta de nenhum serviço.
