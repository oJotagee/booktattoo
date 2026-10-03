# Catalog service

API de serviços oferecidos pelo tatuador e da galeria de flashes (NestJS + Prisma).

- **Porta:** `8083`
- **Banco:** `catalog` (PostgreSQL)
- **Swagger:** `http://localhost:8083/api/docs`
- **Rotas no Kong:** `/services`, `/galeries`

## Responsabilidades

- CRUD de serviços do tatuador (nome, duração, valor do sinal, ativo/inativo)
- Galeria de flashes vinculada a um serviço (estilo, tamanho, preço, disponibilidade) — modelo pronto, endpoints ainda não implementados

O serviço não conhece a tabela de usuários: guarda só o `userId` extraído do JWT, que é **validado** aqui (nunca emitido).

## Endpoints

Todos exigem JWT e operam sobre os dados do usuário logado.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/services` | Lista os serviços do usuário (`limit`, `offset`) |
| `GET` | `/services/:id` | Busca um serviço |
| `POST` | `/services` | Cria serviço |
| `PUT` | `/services/:id` | Atualiza nome, duração e sinal |
| `PATCH` | `/services/:id/status` | Ativa/desativa o serviço |
| `GET` | `/health` | Health check (sem auth) |

## Limites do plano

Ao criar um serviço (`POST /services`) ou um flash (`POST /galeries`), o catalog consulta `GET /users/me/plan` no user-service repassando o mesmo token, e compara com quantos o usuário já tem:

| Acesso | Serviços | Flashs na galeria |
|---|---|---|
| Trial (7 dias) | 20 | 50 |
| Básico | 3 | 5 |
| Profissional | 20 | 50 |
| Expirado | bloqueado | bloqueado |

Serviços desativados contam no limite. Plano expirado ou limite atingido respondem `403`, e user-service fora do ar responde `503`.

## Modelos

- `Service` — `name`, `duration` (minutos), `depositAmount` (centavos), `status`
- `Galery` — `title`, `imageUrl`, `size`, `price`, `style` (`GaleryStyle`), `available`, pertence a um `Service`

Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Arquitetura

```
src/
  domain/          # entidade Service e erros de domínio
  application/     # use cases + port do repositório
  infrastructure/  # Prisma, repositório e mapper
  presentation/    # controllers, DTOs e DomainExceptionFilter
```

## Como rodar

```bash
cp .env.example .env
# em dev fora do Docker, troque os hosts para localhost

bun run docker:dev:up                 # (na raiz)
bun run prisma:migrate:dev:catalog    # (na raiz)
bun run --cwd services/catalog dev
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (8083) |
| `DATABASE_URL` | Conexão com o banco `catalog` |
| `RABBITMQ_URL` | Conexão AMQP |
| `JWT_SECRET` | Mesmo segredo do user-service, usado só para validar o token |
| `USER_SERVICE_URL` | URL interna do user-service, para consultar o plano ao criar serviço ou flash |

## Testes

```bash
bun run --cwd services/catalog test              # unitários
bun run --cwd services/catalog test:integration  # integração (precisa do Postgres)
```
