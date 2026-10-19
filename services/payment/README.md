# Payment service

API de cobrança (NestJS + Stripe). Único serviço que fala com o Stripe: guarda a secret key, cria Checkout/Portal e recebe os webhooks. Cuida da assinatura mensal da plataforma e do sinal dos agendamentos. Os outros serviços só ficam sabendo dos pagamentos pelos eventos que ele publica no RabbitMQ.

- **Porta:** `8084`
- **Banco:** `payment` (PostgreSQL)
- **Swagger:** `http://localhost:8084/api/docs`
- **Rotas no Kong:** `/billing`, `POST /webhooks`

## Fluxo da assinatura (Stripe Billing)

```
front ──POST /billing/checkout {plan}──▶ payment ──▶ Stripe Checkout Session ──url──▶ front redireciona
                                                                 │
tatuador paga no Stripe ─────────────────────────────────────────┘
                                                                 ▼
Stripe ──POST /webhooks/billing──▶ payment (valida assinatura, dedup por event.id,
                                             busca a Subscription atual no Stripe)
                                       │
                                       └─▶ RabbitMQ bookink.events  payment.subscription.{activated|updated|canceled}
                                                       │
                                                       ▼
                                       user (fila user.payment-subscription) ──▶ upsert na tabela Subscription
                                                       ▲
front ──GET /users/me/subscription─────────────────────┘
```

- O front nunca confia no redirect de sucesso: ele só mostra "processando" e lê o status em `GET /users/me/subscription`.
- Upgrade/downgrade/cancelamento acontecem no Billing Portal (`POST /billing/portal`) e chegam como `customer.subscription.updated` / `deleted`.
- O plano é derivado do `priceId` atual (`STRIPE_PRICE_*`), então troca de plano pelo portal atualiza o `plan` corretamente.

## Fluxo do sinal do agendamento (Stripe Checkout)

```
appointment ──POST /internal/deposits/checkout (X-Internal-Secret)──▶ payment ──▶ Checkout Session (mode payment, BRL)
                                                                                     │ metadata.appointmentId
cliente paga (ou abandona) no Stripe ────────────────────────────────────────────────┘
                                                                                     ▼
Stripe ──POST /webhooks/billing──▶ payment ──▶ RabbitMQ  payment.deposit.paid | payment.deposit.expired
                                                              │
                                                              ▼
                                         appointment (fila appointment.payment-events) ──▶ CONFIRMED | CANCELLED
```

- A sessão expira em ~31 minutos, porque o Stripe exige no mínimo 30. A expiração dispara `checkout.session.expired`, que cancela o agendamento e libera o horário.
- O cliente volta para `/{artistId}?booking=success|cancelled`, mas quem confirma o pagamento é o webhook.
- A criação usa `idempotencyKey` por agendamento, então repetir a chamada devolve a mesma sessão.
- O endpoint do webhook no Stripe precisa assinar também `checkout.session.expired`.

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/billing/checkout` | JWT | Cria a Checkout Session (`{ plan: 'BASIC' \| 'PROFESSIONAL' }`) e devolve `{ url }`. 409 se já houver assinatura ativa |
| `POST` | `/billing/portal` | JWT | Cria a sessão do Billing Portal e devolve `{ url }` |
| `POST` | `/billing/change-plan` | JWT | Troca o plano da assinatura ativa (`{ plan }`), com proração. 404 sem assinatura ativa, 409 se já for o plano atual |
| `POST` | `/webhooks/billing` | assinatura Stripe | Webhook de `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` |
| `GET` | `/billing/connect` | JWT | Status da conta Stripe Connect do tatuador (`connected`, `chargesEnabled`, `payoutsEnabled`, `detailsSubmitted`, `paymentsEnabled`), consultado no Stripe a cada chamada |
| `POST` | `/billing/connect/onboarding` | JWT | Cria a conta Express (na primeira vez) e devolve `{ url }` do onboarding |
| `POST` | `/billing/connect/dashboard` | JWT | Devolve `{ url }` do painel Express. 404 sem conta, 409 antes de enviar o cadastro |
| `POST` | `/webhooks/connect` | assinatura Stripe (eventos thin) | Eventos thin `v2.core.account*` das contas conectadas (Accounts v2). O payload só traz o id da conta; o status é consultado no Stripe |
| `POST` | `/internal/deposits/checkout` | `X-Internal-Secret` | Só para o appointment-service (fora do Kong). Recebe `artistId` e cria a Checkout Session do sinal como destination charge para a conta do tatuador (modo payment, expira em ~30 min). Devolve `{ checkoutSessionId, url }`. 409 se a conta não estiver habilitada |
| `POST` | `/internal/deposits/refund` | `X-Internal-Secret` | Estorna o sinal pago numa Checkout Session (`{ appointmentId, checkoutSessionId }`, com `reverse_transfer`). Idempotente por agendamento. Devolve `{ refundId }` |
| `POST` | `/internal/deposits/expire` | `X-Internal-Secret` | Expira a Checkout Session se ainda estiver aberta (204) |
| `GET` | `/health` | — | Health check |

## Eventos publicados

Exchange `bookink.events` (topic). Contrato em [`@bookink/shared/events`](../../packages/shared/src/events/contracts/payment.events.ts).

| Routing key | Quando |
|---|---|
| `payment.subscription.activated` | `checkout.session.completed` (modo subscription) ou `customer.subscription.created` |
| `payment.subscription.updated` | `customer.subscription.updated` |
| `payment.subscription.canceled` | `customer.subscription.deleted` |
| `payment.deposit.paid` | `checkout.session.completed` (modo payment, pago) com `metadata.appointmentId` |
| `payment.deposit.expired` | `checkout.session.expired` (modo payment) com `metadata.appointmentId` |

O `eventId` do envelope é o `id` do evento do Stripe, e o `correlationId` é o id da assinatura (ou do agendamento, nos eventos de sinal). Se a publicação falhar, o webhook responde erro e o Stripe reenvia; o evento só é marcado como processado depois de publicado.

## Modelos

- `BillingCustomer`: `userId` ↔ `stripeCustomerId`
- `ProcessedWebhookEvent`: ids de eventos do Stripe já tratados (idempotência)

## Como rodar

```bash
cp .env.example .env
# em dev fora do Docker, troque os hosts para localhost

bun run prisma:migrate:dev:payment     # (na raiz)
bun run --cwd services/payment dev

# webhooks em dev (Stripe CLI), passando pelo Kong:
stripe listen --forward-to localhost:8000/webhooks/billing --thin-events 'v2.core.account*' --forward-thin-to localhost:8000/webhooks/connect
# copie o whsec_ impresso para STRIPE_BILLING_WEBHOOK_SECRET e STRIPE_CONNECT_WEBHOOK_SECRET
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (8084) |
| `DATABASE_URL` | Conexão com o banco `payment` |
| `RABBITMQ_URL` | Conexão AMQP |
| `JWT_SECRET` | Mesmo segredo do user-service (só valida) |
| `STRIPE_SECRET_KEY` | Secret key do Stripe |
| `STRIPE_BILLING_WEBHOOK_SECRET` | Segredo de assinatura do webhook |
| `STRIPE_PRICE_BASIC` / `STRIPE_PRICE_PROFESSIONAL` | Price IDs dos planos |
| `STRIPE_CHECKOUT_SUCCESS_URL` / `STRIPE_CHECKOUT_CANCEL_URL` | Retorno do Checkout |
| `STRIPE_PORTAL_RETURN_URL` | Retorno do Billing Portal |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Segredo do destino de eventos thin (`v2.core.account*`) que aponta para `/webhooks/connect` |
| `STRIPE_CONNECT_RETURN_URL` / `STRIPE_CONNECT_REFRESH_URL` | Retorno do onboarding Connect e rota que gera um novo link quando o anterior expira |
| `INTERNAL_API_SECRET` | Segredo (mín. 32 caracteres) exigido no header `X-Internal-Secret` em `POST /internal/deposits/checkout`. O mesmo valor deve estar no appointment-service; sem ele a rota fica bloqueada |

## Testes

```bash
bun run --cwd services/payment test
```
