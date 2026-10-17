# Catalog service

API de serviços oferecidos pelo tatuador e da galeria de flashes (NestJS + Prisma).

- **Porta:** `8083`
- **Banco:** `catalog` (PostgreSQL)
- **Swagger:** `http://localhost:8083/api/docs`
- **Rotas no Kong:** `/services`, `/galeries`, `GET /public/services`, `GET /public/galeries` (inclui `/public/galeries/:id`)

## Responsabilidades

- CRUD de serviços do tatuador (nome, duração, valor do sinal, ativo/inativo)
- Galeria de flashes vinculada a um serviço (estilo, tamanho, preço). O tatuador cria, edita e exclui os flashes.
- A disponibilidade do flash não é editável: ela segue os eventos do appointment-service. O flash sai da galeria quando um cliente agenda e volta quando o agendamento é cancelado ou expira.

## Regra de preço

O preço total de um flash nunca pode ser menor que o sinal do serviço vinculado. Igual é permitido. A regra é aplicada:

- ao criar um flash, antes do upload da imagem (`GaleryPriceBelowDepositError`, `400`);
- ao editar um flash, quando muda o preço ou o serviço (`GaleryPriceBelowDepositError`, `400`);
- ao aumentar o sinal de um serviço acima do preço do flash mais barato vinculado a ele (`ServiceDepositAboveGaleryPriceError`, `400`).

O serviço não conhece a tabela de usuários: guarda só o `userId` extraído do JWT, que é **validado** aqui (nunca emitido).

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/services` | JWT | Lista os serviços do usuário (`limit`, `offset`) |
| `GET` | `/services/:id` | JWT | Busca um serviço |
| `POST` | `/services` | JWT | Cria serviço |
| `PUT` | `/services/:id` | JWT | Atualiza nome, duração e sinal |
| `PATCH` | `/services/:id/status` | JWT | Ativa/desativa o serviço |
| `GET` | `/galeries` | JWT | Lista os flashes do usuário (`limit`, `offset`, `style`) |
| `GET` | `/galeries/stats` | JWT | Total de flashes do usuário e quantos estão disponíveis (`{ total, available }`) |
| `GET` | `/galeries/:id` | JWT | Busca um flash |
| `POST` | `/galeries` | JWT | Cria flash (`multipart`, com a imagem) |
| `PUT` | `/galeries/:id` | JWT | Atualiza título, tamanho, preço, estilo e serviço |
| `PUT` | `/galeries/:id/image` | JWT | Troca a imagem do flash |
| `DELETE` | `/galeries/:id` | JWT | Exclui o flash |
| `GET` | `/public/services` | — | Lista serviços públicos (`limit`, `offset`, `userId`), com cache |
| `GET` | `/public/galeries` | — | Lista flashes públicos disponíveis (`limit`, `offset`, `userId`, `style`), com cache |
| `GET` | `/public/galeries/:id` | — | Um flash com `available`, `artistName` e o `service` (`duration`, `depositAmount`), com cache. Usado pelo modal de agendamento e pelo appointment-service |
| `GET` | `/health` | — | Health check |

As rotas autenticadas operam só sobre os dados do usuário logado. As rotas `/public/*` usam o cache Redis de [`@bookink/shared/cache`](../../packages/shared/src/cache). O TTL é de 15 minutos, e quando ele vence só uma requisição recarrega do banco enquanto as outras esperam.

| Namespace | Rotas | Invalidado por |
|---|---|---|
| `catalog:public:galeries` | `/public/galeries` e `/public/galeries/:id` | criar, editar (info ou imagem) ou excluir um flash, reservar ou liberar um flash, mudar o artista e editar ou ativar/desativar um serviço (porque a resposta por id inclui a duração e o sinal) |
| `catalog:public:services` | `/public/services` | criar, editar ou ativar/desativar um serviço |

`/public/galeries` devolve o `artistName` de cada flash e esconde os flashes de artistas inativos. Esses dados vêm da projeção local `Artist` (ver abaixo), sem chamar o user-service.

## Limites do plano

Ao criar um serviço (`POST /services`) ou um flash (`POST /galeries`), o catalog consulta `GET /users/me/plan` no user-service repassando o mesmo token, e compara com quantos o usuário já tem:

| Acesso | Serviços | Flashs na galeria |
|---|---|---|
| Trial (7 dias) | 20 | 50 |
| Básico | 3 | 5 |
| Profissional | 20 | 50 |
| Expirado | bloqueado | bloqueado |

Serviços desativados contam no limite. Plano expirado ou limite atingido respondem `403`, e user-service fora do ar responde `503`.

## Eventos consumidos

| Fila | Exchange | Routing keys | Ação |
|---|---|---|---|
| `catalog.user-events` | `bookink.events` | `user.profile.*` | Upsert do `Artist` (nome, avatar e status do tatuador) e invalidação do cache de `/public/galeries` |
| `catalog.appointment-events` | `bookink.events` | `appointment.*` | `appointment.created` marca o flash como indisponível; `appointment.cancelled` devolve o flash à galeria. Os dois invalidam o cache de `/public/galeries` |

Os eventos de perfil carregam o estado completo. Eventos com `occurredAt` igual ou mais antigo que o `lastEventAt` salvo são ignorados (reentrega ou fora de ordem). Os eventos de agendamento são idempotentes: um flash que já está no estado pedido não é alterado. Falhas vão para a `.dlq` da fila.

## Modelos

- `Service` — `name`, `duration` (minutos), `depositAmount` (centavos), `status`
- `Galery` — `title`, `imageUrl`, `size`, `price`, `style` (`GaleryStyle`), `available`, pertence a um `Service`
- `Artist` — projeção somente leitura do perfil público do tatuador (`id` = id do user, `name`, `image`, `status`, `lastEventAt`), escrita só pelo consumer de `user.profile.updated`

Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Arquitetura

```
src/
  domain/          # entidades Service, Galery e Artist e erros de domínio
  application/     # use cases, handlers de eventos e ports
  infrastructure/  # Prisma, repositórios, mappers, gateway HTTP do plano e consumers RabbitMQ
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
| `RABBITMQ_URL` | Conexão AMQP, para consumir `user.profile.updated` e `appointment.*` |
| `JWT_SECRET` | Mesmo segredo do user-service, usado só para validar o token |
| `USER_SERVICE_URL` | URL interna do user-service, para consultar o plano ao criar serviço ou flash |
| `S3_*` | Bucket das imagens da galeria |
| `REDIS_URL` | Conexão com o Redis do cache das rotas públicas |
| `CACHE_TTL_SECONDS` / `CACHE_REFRESH_AHEAD_SECONDS` | Validade do cache (900) e janela antes do vencimento em que uma requisição recarrega do banco (30) |

## Testes

```bash
bun run --cwd services/catalog test              # unitários
bun run --cwd services/catalog test:integration  # integração (precisa do Postgres)
```
