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
| `/appointments`, `/booking-requests`, `/reminders`, `GET`/`POST /public/appointments` | appointment |
| `/billing`, `POST /webhooks` | payment |

O Swagger de cada serviço fica direto na porta dele: `http://localhost:<porta>/api/docs`.

## Comunicação entre serviços

**Síncrona (HTTP):**

| Quem chama | Rota | Para quê |
|---|---|---|
| catalog → user | `GET /users/me/plan` | Aplicar os limites do plano antes de criar um serviço ou flash |
| appointment → user | `GET /public/artists/:id` | Ler o status e os horários do tatuador ao agendar |
| appointment → catalog | `GET /public/galeries/:id` | Ler o preço, o serviço, a duração e o sinal do flash ao agendar |
| appointment → payment | `POST /internal/deposits/checkout` | Abrir o checkout do sinal. Exige o header `X-Internal-Secret` e a rota não é exposta no Kong |

**Assíncrona (RabbitMQ):** uma exchange topic única, `bookink.events`, com routing key igual ao `type` do evento e uma fila por consumidor. Os contratos dos eventos ficam em [`@bookink/shared/events`](packages/shared/src/events).

| Evento | Publicado por | Consumido por |
|---|---|---|
| `payment.subscription.activated` / `updated` / `canceled` | payment (a partir do webhook do Stripe) | user (fila `user.payment-events`), que atualiza a `Subscription` |
| `payment.deposit.paid` / `expired` | payment (a partir do webhook do Stripe) | appointment (fila `appointment.payment-events`), que confirma ou cancela o agendamento |
| `payment.connect.account.updated` | payment (webhook Connect `account.updated` ou consulta em `GET /billing/connect`) | user (fila `user.payment-events`), que atualiza `paymentsEnabled` do tatuador |
| `appointment.created` / `cancelled` | appointment | catalog (fila `catalog.appointment-events`), que tira o flash da galeria ou o devolve |
| `user.profile.updated` | user (cadastro e alterações de nome, avatar ou status) | catalog (fila `catalog.user-events`), que atualiza a projeção local `Artist` usada na galeria pública |

Mensagens que falham no processamento vão para a fila `<fila>.dlq`, em vez de voltar em loop.

## Cache das rotas públicas

Todas as leituras públicas ficam em cache no **Redis** por 15 minutos:

| Rota | Chave | Invalidada por |
|---|---|---|
| `GET /public/artists` e `/public/artists/:id` | filtros e página, ou id | cadastro e alterações de perfil, horários, status ou avatar |
| `GET /public/services` | filtros e página | criar, editar ou ativar/desativar um serviço |
| `GET /public/galeries` e `/public/galeries/:id` | filtros e página, ou id | criar, editar ou excluir um flash, reservar ou liberar um flash, mudar o artista e editar ou ativar/desativar um serviço |
| `GET /public/appointments/blocked-times` | por tatuador e dia | criar, cancelar ou expirar um agendamento daquele tatuador |

Quando o TTL vence, só uma requisição consulta o banco. As outras esperam, mesmo em outras instâncias, e depois leem os dados novos. A trava é uma chave no próprio Redis. Nos últimos 30 segundos antes de vencer, essa requisição já renova o cache.

Se o Redis estiver fora do ar, as rotas continuam funcionando direto no banco. A invalidação usa um contador de geração por namespace, que faz parte da chave: a escrita incrementa o contador e todas as páginas e filtros daquele namespace deixam de valer de uma vez. A implementação fica em [`@bookink/shared/cache`](packages/shared/src/cache).

O cache é só para leitura. Ao criar um agendamento, a checagem de conflito de horário e de flash é feita no banco, dentro de uma transação.

## Agendamento

1. O tatuador copia o link da página dele no dashboard (`/<id-do-tatuador>`) e manda para os clientes.
2. Na página, o cliente escolhe um flash, a data e um horário livre, e preenche os dados.
   - A agenda usa blocos de 30 minutos sobre os horários de atendimento do tatuador.
   - Um flash ocupa tantos blocos seguidos quanto a duração do serviço vinculado.
   - Horários que já passaram ficam desabilitados.
3. O appointment-service cria o agendamento como `PENDING` e o cliente vai para o Stripe Checkout pagar o sinal. O flash sai da galeria.
4. O webhook do Stripe confirma o pagamento e o agendamento vira `CONFIRMED`. O cliente recebe um e-mail de confirmação. Se o checkout expirar (~30 min), o agendamento é cancelado e o horário e o flash voltam a ficar livres.

**Sinal direto para o tatuador (Stripe Connect).** Cada tatuador conecta uma conta Express em **Recebimentos** no dashboard. O checkout do sinal é uma destination charge (`transfer_data` + `on_behalf_of`), sem taxa da plataforma. O tatuador só aceita agendamentos depois que o Stripe libera cobranças e saques na conta (`paymentsEnabled`). Antes disso, o perfil público avisa que ele ainda não aceita agendamentos online.

**Cancelamento e estorno.** Quando o tatuador cancela um agendamento já pago, o appointment-service pede o estorno ao payment-service (`POST /internal/deposits/refund`, com `reverse_transfer`) antes de gravar o cancelamento. Se o estorno falhar, nada muda e o tatuador pode tentar de novo. O cliente recebe um e-mail avisando do estorno. Cancelar um agendamento pendente expira o checkout aberto. Se um pagamento chegar depois que o agendamento foi cancelado ou expirou, ele é estornado automaticamente. Sinais estornados não entram nos indicadores do dashboard.

Os e-mails ao cliente usam o mesmo SMTP do user-service (variáveis `MAIL_*` no `.env` do appointment).

O preço total de um flash nunca pode ser menor que o sinal do serviço vinculado. Essa regra é validada no formulário e no catalog-service. Detalhes em [services/appointment/README.md](services/appointment/README.md).

## Proteção contra abuso

Duas camadas: o Kong segura o volume por IP, e os serviços seguram o abuso por conta, que não depende de IP.

**Rate limiting no Kong** (plugin `rate-limiting`, `policy: local`, por IP do cliente):

| Rota | Limite |
|---|---|
| `POST /auth/login`, `/auth/register`, `/auth/reset-password` | 10/min e 60/h |
| `POST /auth/forgot-password` | 3/min e 10/h |
| `POST /public/appointments` | 5/min e 20/h |
| `POST /auth/refresh-token`, `/auth/oauth/upsert` | 1000/min (chamadas de sessão do próprio Next) |
| Qualquer outra rota | 300/min |

Quem passa do limite recebe `429`, e o frontend mostra "Muitas tentativas em pouco tempo…".

As chamadas à API saem do servidor do Next, então o Next repassa o IP real do cliente em `X-Forwarded-For` ([frontend/src/lib/api.ts](frontend/src/lib/api.ts)), e o Kong confia nesse header (`KONG_TRUSTED_IPS`, `KONG_REAL_IP_HEADER`). Como quem chama o Kong diretamente consegue forjar esse header, os limites por conta abaixo são a proteção que não dá para contornar trocando de IP.

**Limites por conta nos serviços** (contadores no Redis via `AttemptLimiter` de [`@bookink/shared/cache`](packages/shared/src/cache)):

| Onde | Regra |
|---|---|
| Login (user) | 5 senhas erradas para o mesmo e-mail bloqueiam a conta por 15 minutos (`429`), mesmo com a senha certa durante o bloqueio |
| Esqueci a senha (user) | No máximo 1 e-mail de redefinição por conta a cada 60s. A resposta é sempre a mesma, para não revelar se o e-mail existe |
| Agendamento (appointment) | No máximo 1 agendamento aguardando pagamento por e-mail ou telefone (`409`) |

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
- **Imagens:** S3 privado servido pelo CloudFront (ver [docs/cloudfront.md](docs/cloudfront.md))
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
# (o mesmo whsec_ impresso vale para STRIPE_BILLING_WEBHOOK_SECRET e STRIPE_CONNECT_WEBHOOK_SECRET no .env do payment)
stripe listen --forward-to localhost:8000/webhooks/billing --forward-connect-to localhost:8000/webhooks/connect
```

No dev, o Kong roda no Docker e alcança os serviços na sua máquina via `extra_hosts` (`host-gateway`), então o mesmo `kong.yml` serve para os dois composes.

Cada serviço tem um `.env.example`. Em dev fora do Docker, troque os hosts (`postgres`, `rabbitmq`, `redis`, `user`, `catalog`, `payment`) por `localhost`.

O appointment-service e o payment-service precisam do mesmo `INTERNAL_API_SECRET` (mínimo de 32 caracteres) para abrir o checkout do sinal.

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
- Rotas públicas de artistas, galeria, serviços e horários, com cache no Redis
- Assinatura mensal com trial, limites por plano e troca de plano
- Página pública do tatuador, com link para compartilhar
- Agendamento de flash com o sinal pago no Stripe Checkout
- Sinal pago direto para a conta do tatuador, com Stripe Connect (Express)
- Estorno automático ao cancelar um agendamento já pago e em pagamentos tardios
- E-mails de confirmação e de estorno para o cliente
- Dashboard com indicadores do dia e a agenda do dia
