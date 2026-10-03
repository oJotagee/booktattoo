# Payment service

API de cobrança (NestJS + Stripe). Único serviço que fala com o Stripe: guarda a secret key, cria Checkout/Portal e recebe os webhooks. Os outros serviços só ficam sabendo do estado da assinatura pelos eventos que ele publica no RabbitMQ.

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

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/billing/checkout` | JWT | Cria a Checkout Session (`{ plan: 'BASIC' \| 'PROFESSIONAL' }`) e devolve `{ url }`. 409 se já houver assinatura ativa |
| `POST` | `/billing/portal` | JWT | Cria a sessão do Billing Portal e devolve `{ url }` |
| `POST` | `/webhooks/billing` | assinatura Stripe | Webhook de `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` |
| `GET` | `/health` | — | Health check |

## Eventos publicados

Exchange `bookink.events` (topic). Contrato em [`@bookink/shared/events`](../../packages/shared/src/events/contracts/payment.events.ts).

| Routing key | Quando |
|---|---|
| `payment.subscription.activated` | `checkout.session.completed` em modo subscription |
| `payment.subscription.updated` | `customer.subscription.updated` |
| `payment.subscription.canceled` | `customer.subscription.deleted` |

O `eventId` do envelope é o `id` do evento do Stripe, e o `correlationId` é o id da assinatura. Se a publicação falhar, o webhook responde erro e o Stripe reenvia; o evento só é marcado como processado depois de publicado.

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
stripe listen --forward-to localhost:8000/webhooks/billing
# copie o whsec_ impresso para STRIPE_BILLING_WEBHOOK_SECRET
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

## Testes

```bash
bun run --cwd services/payment test
```
