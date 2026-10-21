# Appointment service

API de agendamentos (NestJS + Prisma).

> **Status:** Reminders, agendamento de flash com sinal e conversas de booking request implementados.

- **Porta:** `8082`
- **Banco:** `appointment` (PostgreSQL)
- **Swagger:** `http://localhost:8082/api/docs`
- **Rotas no Kong:** `/appointments`, `/booking-requests`, `/reminders`, `/public/appointments` (GET/POST)

## Responsabilidades

- **Appointments** — o cliente agenda um flash pela galeria e paga o sinal no Stripe Checkout; o tatuador vê a agenda do dia no dashboard
- **Reminders** — lembretes do tatuador
- **Booking requests** — conversa entre o cliente (sem login, por um link assinado) e o tatuador, para pedidos fora da galeria

Serviço e flash vêm do catalog-service e o tatuador do user-service; aqui ficam só os ids (`userId`, `serviceId`, `galeryId`). Duração, preço, sinal, título e imagem do flash são copiados no momento da criação, para que mudanças posteriores no catálogo não alterem agendamentos existentes.

## Agenda

- A agenda trabalha em slots de 30 minutos sobre a lista `times` do tatuador (`"HH:mm"`, editada no perfil).
- Um agendamento guarda só o início (`scheduledAt`) e ocupa `ceil(duration / 30)` slots, contados na ordem de `times`.
- Datas e horários são do fuso do estúdio (`America/Sao_Paulo`, offset fixo `-03:00`): `?date=yyyy-MM-dd` vira o intervalo `[00:00, 24:00)` desse dia.
- `PENDING` e `CONFIRMED` ocupam o horário e o flash. A checagem de conflito e o insert rodam na mesma transação, com um advisory lock por tatuador.

### Fluxo do sinal

1. `POST /public/appointments` valida tatuador, flash e horário, cria o agendamento `PENDING` e pede ao payment-service (`POST /internal/deposits/checkout`, header `X-Internal-Secret`) uma Checkout Session que expira em ~30 min.
2. Publica `appointment.created`; o catalog-service tira o flash da galeria.
3. O webhook do Stripe chega no payment-service, que publica `payment.deposit.paid` ou `payment.deposit.expired`.
4. Pago: o agendamento vira `CONFIRMED` com `paidAt`. Expirado: vira `CANCELLED` e publica `appointment.cancelled`, que devolve o flash à galeria.

Se o checkout não puder ser criado, o agendamento é cancelado na hora para não prender o horário.

Cada cliente pode ter no máximo 1 agendamento `PENDING` por vez, identificado pelo e-mail ou pelo telefone (guardado só com dígitos). Um segundo pedido enquanto o primeiro aguarda pagamento responde `PendingAppointmentLimitError` (`409`). A checagem roda na mesma transação do insert, e impede que alguém segure vários horários em loop.

### Cache dos horários ocupados

`GET /public/appointments/blocked-times` usa o cache Redis de [`@bookink/shared/cache`](../../packages/shared/src/cache), com um namespace por tatuador (`appointment:public:blocked-times:<artistId>`) e uma chave por dia.

- O cache guarda só os agendamentos ativos do dia (início e duração). Os horários de atendimento vêm do user-service a cada chamada, então mudar o perfil não deixa a agenda pública desatualizada.
- O namespace é invalidado quando os agendamentos ativos do tatuador mudam: ao criar (inclusive quando o checkout falha e o agendamento é cancelado), ao cancelar e ao expirar. Confirmar o pagamento não muda o bloqueio, porque um agendamento `PENDING` já ocupa o horário.
- A criação nunca lê esse cache: a checagem de conflito é feita no banco, dentro da transação com advisory lock.

## Booking requests (conversa com o tatuador)

Serve para pedir algo que não está na galeria, como uma tatuagem autoral, um orçamento ou uma dúvida. O cliente não cria conta.

1. Na página do tatuador, o cliente envia nome, e-mail, telefone e a primeira mensagem (`POST /public/booking-requests`).
2. A resposta traz um `token`. O front leva o cliente para `/pedido/<token>`, e o mesmo link chega por e-mail. Esse link é o único acesso do cliente à conversa.
3. O tatuador vê a conversa no dashboard, responde e pode encerrá-la. Depois de encerrada, ninguém manda mensagem nova, mas os dois ainda leem o histórico.
4. A cada mensagem, o outro lado recebe um e-mail. O cliente recebe o link da conversa. O tatuador recebe o link do painel, e o e-mail dele vem de `GET /internal/artists/:id/contact` no user-service.

**Link.** O token é `base64url(requestId).base64url(HMAC-SHA256(BOOKING_LINK_SECRET, requestId))`:
- Nada fica salvo no banco, então todo e-mail pode regerar o link. A verificação usa `timingSafeEqual`.
- Token inválido e conversa inexistente respondem o mesmo `404`.
- O token vai no header `X-Booking-Token`, nunca na URL da API. Assim ele não aparece nos logs do Kong.
- Trocar `BOOKING_LINK_SECRET` invalida todos os links já enviados.

**Limites.**
- Cada cliente pode ter só 1 conversa aberta por tatuador, identificado pelo e-mail ou pelo telefone. Um segundo pedido responde `OpenBookingRequestLimitError` (`409`). A checagem roda na mesma transação do insert, com o advisory lock por tatuador.
- O cliente pode mandar no máximo 5 mensagens seguidas sem resposta. A sexta responde `ClientMessageLimitError` (`429`).
- O tatuador precisa estar `ACTIVE`. Ele não precisa ter o Stripe conectado.
- As mensagens têm no máximo 2000 caracteres.

## Modelos

- `Appointment` — `clientName`, `clientEmail`, `clientPhone`, `scheduledAt`, `duration`, `price`, `depositAmount`, `status` (`PENDING` / `CONFIRMED` / `CANCELLED` / `COMPLETED`), snapshot do flash (`galeryId`, `galeryTitle`, `galeryImageUrl`), `checkoutSessionId`, `paidAt`
- `BookingRequest` — `clientName`, `clientEmail`, `clientPhone`, `status` (`OPEN` / `CLOSED`), `lastMessageAt`, `closedAt`
- `BookingRequestMessage` — `author` (`ARTIST` / `CLIENT` / `SYSTEM`), `body`
- `BookingOffer` — `title`, `scheduledAt`, `duration`, `price`, `depositAmount`, `status` (`PENDING` / `PAID` / `WITHDRAWN`), `appointmentId`, `paidAt`
- `Reminder` — `description`

Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Endpoints

### Públicos (sem auth)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/public/appointments/blocked-times?artistId&date` | Horários ocupados do tatuador no dia (`{ blockedTimes }`), com cache |
| `POST` | `/public/appointments` | Cria o agendamento e devolve `{ appointmentId, checkoutUrl }` |
| `POST` | `/public/booking-requests` | Abre uma conversa com o tatuador e devolve `{ token }` |
| `GET` | `/public/booking-requests/conversation` | Conversa do cliente (header `X-Booking-Token`) |
| `POST` | `/public/booking-requests/conversation/messages` | Mensagem do cliente (header `X-Booking-Token`) |
| `POST` | `/public/booking-requests/conversation/offer/pay` | Paga o sinal da proposta pendente e devolve `{ checkoutUrl }` (header `X-Booking-Token`) |
| `GET` | `/health` | Health check |

### Do tatuador (JWT)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/appointments?date=yyyy-MM-dd` | Agendamentos do dia (exceto cancelados) |
| `GET` | `/appointments/stats` | Agendamentos de hoje por status, flashs reservados e sinais pagos no mês |
| `PATCH` | `/appointments/:id/cancel` | Cancela e devolve o flash à galeria (`204`) |
| `GET` | `/reminders` | Lista os lembretes do usuário, mais recentes primeiro (`limit`, `offset`) |
| `GET` | `/reminders/:id` | Busca um lembrete |
| `POST` | `/reminders` | Cria lembrete |
| `PUT` | `/reminders/:id` | Atualiza a descrição |
| `DELETE` | `/reminders/:id` | Remove o lembrete (`204`) |
| `GET` | `/booking-requests?status=OPEN\|CLOSED` | Conversas do tatuador com a última mensagem e `awaitingReply`, da mais recente para a mais antiga (`limit`, `offset`) |
| `GET` | `/booking-requests/:id` | Conversa com as mensagens e o contato do cliente |
| `POST` | `/booking-requests/:id/messages` | Resposta do tatuador |
| `PATCH` | `/booking-requests/:id/close` | Encerra a conversa e retira a proposta pendente (`204`) |
| `POST` | `/booking-requests/:id/offer` | Envia uma proposta de agendamento (retira a anterior) |
| `DELETE` | `/booking-requests/:id/offer` | Retira a proposta pendente (`204`) |

### Eventos

- Publica: `appointment.created`, `appointment.cancelled`
- Consome (fila `appointment.payment-events`): `payment.deposit.paid`, `payment.deposit.expired`

## Arquitetura

```
src/
  domain/          # entidades, erros de domínio e regras de agenda (schedule.ts)
  application/     # use cases, handlers de eventos, ports (repositórios e gateways) e namespaces de cache
  infrastructure/  # Prisma, repositórios, gateways HTTP e consumers RabbitMQ
  presentation/    # controllers, DTOs e DomainExceptionFilter
```

## Testes

```bash
bun run --cwd services/appointment test               # unitários
bun run --cwd services/appointment test:integration   # integração (precisa do banco)
```

## Como rodar

```bash
cp .env.example .env
# em dev fora do Docker, troque os hosts para localhost

bun run docker:dev:up                     # (na raiz)
bun run prisma:migrate:dev:appointment    # (na raiz)
bun run --cwd services/appointment dev
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (8082) |
| `DATABASE_URL` | Conexão com o banco `appointment` |
| `RABBITMQ_URL` | Conexão AMQP |
| `REDIS_URL` | Redis do cache da rota pública de horários ocupados (`CACHE_TTL_SECONDS`, `CACHE_REFRESH_AHEAD_SECONDS`) |
| `JWT_SECRET` | Mesmo segredo do user-service, usado só para validar o token |
| `USER_SERVICE_URL` | URL interna do user-service, para ler o tatuador e seus horários |
| `CATALOG_SERVICE_URL` | URL interna do catalog-service, para ler o flash e o serviço |
| `PAYMENT_SERVICE_URL` | URL interna do payment-service, para abrir o checkout do sinal |
| `INTERNAL_API_SECRET` | Mesmo segredo do payment-service e do user-service, enviado em `X-Internal-Secret` |
| `BOOKING_LINK_SECRET` | Assina os links `/pedido/<token>` das conversas (mínimo de 32 caracteres; o serviço não sobe sem ele) |
| `FRONTEND_URL` | Base do frontend; o Stripe devolve o cliente para `/{artistId}?booking=success\|cancelled` |
