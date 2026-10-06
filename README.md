# Book Tattoo

Micro-SaaS de agendamento para estúdios de tatuagem: o tatuador organiza serviços, galeria e horários num painel próprio, e o cliente agenda sozinho, com o sinal pago na hora. A plataforma é oferecida por assinatura mensal.

## Estrutura do projeto

Monorepo gerenciado com Bun workspaces:

```
frontend/             # Aplicação web (Next.js)
services/user/        # Usuários, autenticação e assinatura (NestJS) — :8081
services/catalog/     # Serviços e galeria (NestJS) — :8083
services/appointment/ # Agendamentos (NestJS) — :8082
services/payment/     # Cobrança com Stripe (NestJS) — :8084
packages/shared/      # Guard JWT, eventos, e-mail, storage, cache e DTOs compartilhados
docker/               # Configurações auxiliares (Postgres, Kong)
```

Cada serviço tem o próprio banco PostgreSQL e segue camadas separadas (domain, application, infrastructure e presentation). Entre serviços só trafegam ids, nunca chaves estrangeiras.

O frontend fala só com o **API gateway (Kong)** em `http://localhost:8000`, que roteia pelo prefixo da rota (config em [docker/kong/kong.yml](docker/kong/kong.yml)):

| Rota | Serviço |
|---|---|
| `/auth`, `/users`, `GET /public/artists` | user |
| `/services`, `/galeries`, `GET /public/services`, `GET /public/galeries` | catalog |
| `/appointments`, `/booking-requests`, `/reminders` | appointment |
| `/billing`, `POST /webhooks` | payment |

O Swagger de cada serviço fica direto na porta dele: `http://localhost:<porta>/api/docs`.

## Comunicação entre serviços

- **Síncrona (HTTP):** o catalog consulta `GET /users/me/plan` no user antes de criar um serviço ou flash, para aplicar os limites do plano.
- **Assíncrona (RabbitMQ):** uma exchange topic única, `bookink.events`, com routing key igual ao `type` do evento e uma fila por consumidor. Os contratos dos eventos ficam em [`@bookink/shared/events`](packages/shared/src/events).

| Evento | Publicado por | Consumido por |
|---|---|---|
| `payment.subscription.activated` / `updated` / `canceled` | payment (a partir do webhook do Stripe) | user (fila `user.payment-events`), que atualiza a `Subscription` |

Mensagens que falham no processamento vão para a fila `<fila>.dlq`, em vez de voltar em loop.

## Cache das rotas públicas

As listagens públicas (`GET /public/artists`, `/public/galeries` e `/public/services`) ficam em cache no **Redis** por 15 minutos, uma chave por combinação de filtros e página. Nos últimos 30 segundos antes de vencer, só uma requisição consulta o banco e regrava o cache. As outras esperam, mesmo em outras instâncias, e depois leem os dados novos. A trava é uma chave no próprio Redis.

Se o Redis estiver fora do ar, as rotas continuam funcionando direto no banco. Cadastrar, editar ou excluir um flash, serviço ou perfil invalida na hora a listagem correspondente (todas as páginas e filtros): cada listagem tem um contador de geração no Redis que faz parte da chave, e a escrita incrementa o contador. A implementação fica em [`@bookink/shared/cache`](packages/shared/src/cache).

## Assinatura e planos

| Acesso | Serviços | Flashs na galeria |
|---|---|---|
| Trial (7 dias após o cadastro) | 20 | 50 |
| Básico | 3 | 5 |
| Profissional | 20 | 50 |
| Expirado | bloqueado | bloqueado |

O pagamento é feito pelo Stripe Billing: Checkout para assinar, `POST /billing/change-plan` para trocar de plano e o Billing Portal para cartão e cancelamento. Quem confirma o pagamento é o webhook do Stripe, nunca o redirect de sucesso. O front só mostra "processando" até o evento chegar ao user. Detalhes em [services/payment/README.md](services/payment/README.md).

## Stack

- **Frontend:** Next.js + Auth.js
- **Backend:** NestJS + Prisma
- **Banco de dados:** PostgreSQL (um banco por serviço)
- **Mensageria:** RabbitMQ
- **Cache:** Redis
- **API gateway:** Kong (DB-less)
- **Pagamentos:** Stripe
- **Gerenciador de pacotes:** Bun
- **Lint/format:** Biome
- **Testes:** `bun test` (unitários e integração) e Playwright (E2E do front)

## Como rodar

Pré-requisitos: [Bun](https://bun.sh) e Docker instalados. Para testar pagamentos em dev, também a [Stripe CLI](https://docs.stripe.com/stripe-cli).

```bash
# instalar dependências
bun install

# subir Postgres, RabbitMQ, Redis, serviços e Kong em containers
bun run docker:up

# ou, para ambiente de desenvolvimento (Postgres, RabbitMQ, Redis e Kong)
bun run docker:dev:up
# ...e cada serviço na máquina, com hot reload
bun run --cwd services/user dev
bun run --cwd services/catalog dev
bun run --cwd services/appointment dev
bun run --cwd services/payment dev

# webhooks do Stripe em dev, passando pelo Kong
# (copie o whsec_ impresso para STRIPE_BILLING_WEBHOOK_SECRET no .env do payment)
stripe listen --forward-to localhost:8000/webhooks/billing
```

No dev, o Kong roda no Docker e alcança os serviços na sua máquina via `extra_hosts` (`host-gateway`), então o mesmo `kong.yml` serve para os dois composes.

Cada serviço tem um `.env.example`. Em dev fora do Docker, troque os hosts (`postgres`, `rabbitmq`, `redis`, `user`) por `localhost`.

### Migrations em produção

Preencha `DATABASE_PROD_URL` no `.env` de cada serviço com a `DATABASE_PUBLIC_URL` do Postgres no Railway, trocando o banco no fim da URL pelo do serviço (`/user`, `/catalog`...). Depois:

```bash
bun run prisma:status:prod:catalog          # lista as migrations pendentes
bun run prisma:migrate:deploy:prod:catalog  # aplica as pendentes
```

O mesmo vale para `user`, `appointment` e `payment`. Antes de aplicar as migrations do `user` que movem tabelas para o catalog e o appointment, leia o comentário no topo delas.

Outros comandos úteis estão em [package.json](package.json), como `lint`, `test:unit` e os comandos `prisma:*` para migrations de cada serviço.

## Status

Projeto em desenvolvimento. Já funcionam:
- Cadastro, login (e-mail/senha, Google e GitHub) e recuperação de senha
- Perfil e status do artista
- Serviços e galeria
- Listagens públicas de artistas, galeria e serviços, com cache no Redis
- Assinatura mensal com trial, limites por plano e troca de plano

Próximos passos:
- Agendamento com pagamento do sinal pelo Stripe Connect, direto para o tatuador
