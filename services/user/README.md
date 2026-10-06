# User service

API de usuários e autenticação (NestJS + Prisma). Emite os JWTs de sessão que os outros serviços apenas validam.

- **Porta:** `8081`
- **Banco:** `user` (PostgreSQL)
- **Swagger:** `http://localhost:8081/api/docs`
- **Rotas no Kong:** `/auth`, `/users`, `GET /public/artists`

## Responsabilidades

- Cadastro e login por email/senha (bcrypt)
- Login social (GitHub/Google) via upsert de conta chamado pelo NextAuth
- Emissão de `accessToken` (JWT) e rotação de `refreshToken`
- Esqueci/redefinir senha com token enviado por email
- Perfil do tatuador: contato, status (ativo/inativo/férias) e avatar (S3)
- Listagem pública de artistas, paginada e com cache no Redis

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | — | Cadastro por email/senha |
| `POST` | `/auth/login` | — | Login, retorna sessão (user + tokens) |
| `POST` | `/auth/oauth/upsert` | — | Cria/vincula conta OAuth e retorna sessão |
| `POST` | `/auth/refresh-token` | — | Troca o refresh token por uma nova sessão |
| `POST` | `/auth/forgot-password` | — | Envia email com link de redefinição |
| `POST` | `/auth/reset-password` | — | Redefine a senha a partir do token |
| `GET` | `/users/me` | JWT | Dados do usuário logado |
| `GET` | `/users/me/plan` | JWT | Acesso do plano: `TRIAL` (7 dias após o cadastro), `ACTIVE` ou `EXPIRED`, com os limites e o resumo da assinatura |
| `PUT` | `/users/me` | JWT | Atualiza dados de contato |
| `PATCH` | `/users/me/status` | JWT | Atualiza status |
| `PUT` | `/users/me/avatar` | JWT | Upload de avatar (`multipart`, campo `file`) |
| `GET` | `/public/artists` | — | Lista artistas (`limit`, `offset`), com cache de 15 minutos invalidado por cadastro e alterações de perfil, status ou avatar |
| `GET` | `/health` | — | Health check |

## Modelos

`User`, `Account` (credentials/oauth), `RefreshToken`, `PasswordResetToken` e `Subscription` (escrita só pelo consumer de eventos do payment-service, ver abaixo). Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Arquitetura

Camadas no estilo clean/hexagonal:

```
src/
  domain/          # entidades, value objects (Email) e erros de domínio
  application/     # use cases + ports (interfaces de repositório, hasher, token issuer...)
  infrastructure/  # Prisma, repositórios, bcrypt, JWT, mappers
  presentation/    # controllers, DTOs e DomainExceptionFilter
```

Storage (S3), email (SMTP), cache (Redis) e o guard JWT vêm de [`@bookink/shared`](../../packages/shared).

## Eventos publicados

| Routing key | Quando |
|---|---|
| `user.profile.updated` | Cadastro (e-mail ou OAuth) e alteração de contato, status ou avatar |

O payload é o perfil público completo (`userId`, `name`, `image`, `status`), e o `occurredAt` é o `updatedAt` do usuário. A publicação acontece depois de salvar: se o RabbitMQ estiver fora, a operação conclui normalmente e a falha fica só no log. Para ressincronizar (depois de uma queda do broker), o `RepublishArtistProfilesUseCase` republica todos os perfis. Republicar é seguro: o consumidor ignora eventos que não são mais novos que o estado que já tem.

## Eventos consumidos

| Fila | Exchange | Routing keys | Ação |
|---|---|---|---|
| `user.payment-events` | `bookink.events` | `payment.subscription.*` | Upsert da `Subscription` do usuário |

O evento carrega o estado completo da assinatura. Eventos com `occurredAt` mais antigo que o `lastEventAt` salvo são ignorados (entrega fora de ordem). Falhas técnicas (banco fora, payload inválido) vão para `user.payment-events.dlq`.

## Como rodar

```bash
cp .env.example .env
# em dev fora do Docker, troque os hosts para localhost:
# DATABASE_URL="postgresql://admin:admin@localhost:5432/user"
# RABBITMQ_URL="amqp://admin:admin@localhost:5672"
# REDIS_URL="redis://localhost:6379"

bun run docker:dev:up              # (na raiz) Postgres, RabbitMQ, Redis e Kong
bun run prisma:migrate:dev:user    # (na raiz) aplica as migrations
bun run --cwd services/user dev    # hot reload
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (8081) |
| `DATABASE_URL` | Conexão com o banco `user` |
| `RABBITMQ_URL` | Conexão AMQP, para consumir eventos do payment e publicar `user.profile.updated` |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Assinatura e validade do access token. O mesmo `JWT_SECRET` deve estar nos outros serviços |
| `S3_*` | Bucket de avatares (`S3_ENDPOINT` / `S3_FORCE_PATH_STYLE` para MinIO em dev) |
| `MAIL_*` | SMTP para envio dos emails de redefinição de senha |
| `FRONTEND_RESET_PASSWORD_URL` | Base do link enviado no email de redefinição |
| `REDIS_URL` | Conexão com o Redis do cache de `GET /public/artists` |
| `CACHE_TTL_SECONDS` / `CACHE_REFRESH_AHEAD_SECONDS` | Validade do cache (900) e janela antes do vencimento em que uma requisição recarrega do banco (30) |

## Testes

```bash
bun run --cwd services/user test              # unitários
bun run --cwd services/user test:integration  # integração (precisa do Postgres)
```
