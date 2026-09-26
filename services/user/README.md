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
- Listagem pública de artistas, paginada

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
| `PUT` | `/users/me` | JWT | Atualiza dados de contato |
| `PATCH` | `/users/me/status` | JWT | Atualiza status |
| `PUT` | `/users/me/avatar` | JWT | Upload de avatar (`multipart`, campo `file`) |
| `GET` | `/public/artists` | — | Lista artistas (`limit`, `offset`) |
| `GET` | `/health` | — | Health check |

## Modelos

`User`, `Account` (credentials/oauth), `RefreshToken`, `PasswordResetToken` e `Subscription` (base para os planos; ainda sem fluxo de cobrança). Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Arquitetura

Camadas no estilo clean/hexagonal:

```
src/
  domain/          # entidades, value objects (Email) e erros de domínio
  application/     # use cases + ports (interfaces de repositório, hasher, token issuer...)
  infrastructure/  # Prisma, repositórios, bcrypt, JWT, mappers
  presentation/    # controllers, DTOs e DomainExceptionFilter
```

Storage (S3), email (SMTP) e o guard JWT vêm de [`@bookink/shared`](../../packages/shared).

## Como rodar

```bash
cp .env.example .env
# em dev fora do Docker, troque os hosts para localhost:
# DATABASE_URL="postgresql://admin:admin@localhost:5432/user"
# RABBITMQ_URL="amqp://admin:admin@localhost:5672"

bun run docker:dev:up              # (na raiz) Postgres, RabbitMQ e Kong
bun run prisma:migrate:dev:user    # (na raiz) aplica as migrations
bun run --cwd services/user dev    # hot reload
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (8081) |
| `DATABASE_URL` | Conexão com o banco `user` |
| `RABBITMQ_URL` | Conexão AMQP |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Assinatura e validade do access token. O mesmo `JWT_SECRET` deve estar nos outros serviços |
| `S3_*` | Bucket de avatares (`S3_ENDPOINT` / `S3_FORCE_PATH_STYLE` para MinIO em dev) |
| `MAIL_*` | SMTP para envio dos emails de redefinição de senha |
| `FRONTEND_RESET_PASSWORD_URL` | Base do link enviado no email de redefinição |

## Testes

```bash
bun run --cwd services/user test              # unitários
bun run --cwd services/user test:integration  # integração (precisa do Postgres)
```
