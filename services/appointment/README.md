# Appointment service

API de agendamentos (NestJS + Prisma).

> **Status:** Reminders implementado. Booking requests e appointments têm só o schema.

- **Porta:** `8082`
- **Banco:** `appointment` (PostgreSQL)
- **Swagger:** `http://localhost:8082/api/docs`
- **Rotas no Kong:** `/appointments`, `/booking-requests`, `/reminders`

## Responsabilidades (planejadas)

- **Booking requests** — pedidos de agendamento feitos pelo cliente, que o tatuador aceita ou recusa
- **Appointments** — horários marcados, criados a partir de um pedido aceito ou direto pelo tatuador
- **Reminders** — lembretes do tatuador

Serviço e flash vêm do catalog-service e o tatuador do user-service; aqui ficam só os ids (`userId`, `serviceId`, `galeryId`). Duração e preço são copiados no momento da criação, para que mudanças posteriores no catálogo não alterem agendamentos existentes.

## Modelos

- `BookingRequest` — `clientName`, `clientContact`, `message`, `status` (`PENDING` / `ACCEPTED` / `DECLINED`)
- `Appointment` — `clientName`, `clientContact`, `scheduledAt`, `duration`, `price`, `status` (`PENDING` / `CONFIRMED` / `CANCELLED` / `COMPLETED`), vínculo opcional com um `BookingRequest`
- `Reminder` — `description`

Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Endpoints

Todos exigem JWT e operam sobre os dados do usuário logado.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/reminders` | Lista os lembretes do usuário, mais recentes primeiro (`limit`, `offset`) |
| `GET` | `/reminders/:id` | Busca um lembrete |
| `POST` | `/reminders` | Cria lembrete |
| `PUT` | `/reminders/:id` | Atualiza a descrição |
| `DELETE` | `/reminders/:id` | Remove o lembrete (`204`) |
| `GET` | `/health` | Health check (sem auth) |

## Arquitetura

```
src/
  domain/          # entidade Reminder e erros de domínio
  application/     # use cases + port do repositório
  infrastructure/  # Prisma, repositório e mapper
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
| `JWT_SECRET` | Mesmo segredo do user-service, usado só para validar o token |
| `USER_SERVICE_URL` | URL interna do user-service, para validar o usuário |
| `CATALOG_SERVICE_URL` | URL interna do catalog-service, para validar serviço/flash |