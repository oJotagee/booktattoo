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
packages/shared/      # Guard JWT, eventos, e-mail, storage e DTOs compartilhados
docker/               # Configurações auxiliares (Postgres, Kong)
```

Cada serviço tem o próprio banco PostgreSQL e segue camadas separadas (domain, application, infrastructure e presentation). Entre serviços só trafegam ids, nunca chaves estrangeiras.

O frontend fala só com o **API gateway (Kong)** em `http://localhost:8000`, que roteia pelo prefixo da rota (config em [docker/kong/kong.yml](docker/kong/kong.yml)):

| Rota | Serviço |
|---|---|
| `/auth`, `/users`, `GET /public/artists` | user |
| `/services`, `/galeries` | catalog |
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

# subir Postgres, RabbitMQ, serviços e Kong em containers
bun run docker:up

# ou, para ambiente de desenvolvimento (Postgres, RabbitMQ e Kong)
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

Cada serviço tem um `.env.example`. Em dev fora do Docker, troque os hosts (`postgres`, `rabbitmq`, `user`) por `localhost`.

Outros comandos úteis estão em [package.json](package.json), como `lint`, `test:unit` e os comandos `prisma:*` para migrations de cada serviço.

## Status

Projeto em desenvolvimento. Já funcionam:
- Cadastro, login (e-mail/senha, Google e GitHub) e recuperação de senha
- Perfil e status do artista
- Serviços e galeria
- Assinatura mensal com trial, limites por plano e troca de plano

Próximos passos:
- Área pública do cliente para escolher flash ou serviço
- Agendamento com pagamento do sinal pelo Stripe Connect, direto para o tatuador
