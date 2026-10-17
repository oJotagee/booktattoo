# Frontend

Aplicação web do Book Tattoo:
- landing page pública (equipe de artistas, galeria, como funciona);
- página de cada tatuador com o agendamento dos flashes;
- autenticação;
- painel do tatuador.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **NextAuth v5** — login com email/senha, GitHub e Google
- **TanStack Query** e **TanStack Table**
- **react-hook-form** + **zod** para formulários
- **Tailwind CSS 4** + **shadcn/ui** (Base UI), com `react-day-picker` no seletor de datas
- **axios** para falar com o API gateway
- **Biome** (lint/format), **bun test** (unitários e de interação com happy-dom) e **Playwright** (E2E)

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
| `bun run test:interaction` | Testes de componentes com happy-dom e Testing Library (`tests/interaction`) |
| `bun run test:e2e` | Testes E2E com Playwright |

## Estrutura

```
src/
  app/
    (public)/               # landing, galeria, artistas, login/cadastro, forgot/reset password
      [id]/                 # página pública do tatuador (o link que ele manda para os clientes)
      _components/booking/  # modal de agendamento em 2 passos
    (panel)/dashboard/      # painel autenticado: indicadores, agenda do dia, lembretes, perfil, serviços, galeria, planos
    api/auth/[...nextauth]/ # handlers do NextAuth
  components/               # componentes compartilhados (ui/ = shadcn, date-picker)
  lib/                      # auth (NextAuth), cliente axios, sessão, erros da API e regras de agenda (schedule.ts)
  hooks/
  utils/                    # formatadores (telefone, serviço, galeria), planos e permissões
  proxy.ts                  # protege /dashboard/* (redireciona sem sessão)
tests/unit/                 # espelha a estrutura de src/
tests/interaction/          # componentes renderizados, com mocks de next/navigation, next/image e sonner
```

Cada rota segue a convenção:

- `_components/` — componentes da página, com os schemas zod e os hooks de formulário em `schemas.ts`
- `_actions/` — server actions (mutations)
- `_data-access/` — leituras server-side, usadas como `queryFn` do React Query nas páginas client

## Agendamento (área do cliente)

- **Página do tatuador:** `/<id-do-tatuador>`. Mostra o perfil e a galeria filtrada pelos flashes dele, sem o header da home. Ids com caracteres de arquivo (`.`, por exemplo) dão 404 sem chamar a API.
- **Modal de agendamento:** abre pelo botão "Agendar" do flash, na galeria ou na página do tatuador.
  1. Data, horário e dados do cliente. Os horários seguem as regras de [src/lib/schedule.ts](src/lib/schedule.ts):
     - blocos de 30 minutos;
     - um flash ocupa blocos seguidos conforme a duração do serviço;
     - horários ocupados, os que já passaram e os sem espaço para a duração ficam desabilitados.
  2. Resumo e sinal. "Pagar sinal" cria o agendamento e redireciona para o Stripe Checkout.
- **Volta do Stripe:** o cliente volta para `/<id-do-tatuador>?booking=success|cancelled` e vê um toast com o resultado.
- **Atualização:** as consultas públicas buscam de novo ao voltar para a aba. Assim um flash cadastrado ou reservado aparece sem recarregar a página.

## Painel do tatuador

- **Indicadores:** agendamentos de hoje (com os pendentes), flashes reservados, sinais recebidos no mês e flashes disponíveis. Se um serviço do backend falhar, o card dele mostra "—" e o resto do painel continua funcionando.
- **Agenda do dia:**
  - mostra todos os horários de atendimento: livres, encerrados (já passaram) e reservados;
  - cada agendamento aparece no horário de início, com o intervalo completo. Os horários seguintes ficam agrupados e podem ser recolhidos;
  - a data é escolhida pelo date picker, e os detalhes de cada agendamento permitem cancelar.
- **"Copiar meu link":** botão no cabeçalho que copia o link da página do tatuador.
- **Formulário do flash:** o preço total não pode ser menor que o sinal do serviço vinculado. A mesma regra vale no backend.

## Autenticação

O NextAuth usa estratégia `jwt`. No login por credenciais ele chama `POST /auth/login`; no login social chama `POST /auth/oauth/upsert` no user-service. O `accessToken` e o `refreshToken` retornados ficam no token do NextAuth e são enviados como `Bearer` nas chamadas autenticadas ao gateway (ver [src/lib/get-access-token.ts](src/lib/get-access-token.ts)).

Todas as requisições passam pelo Kong ([src/lib/api.ts](src/lib/api.ts)); o front não conhece a porta de nenhum serviço.
