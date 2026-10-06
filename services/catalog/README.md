# Catalog service

API de serviços oferecidos pelo tatuador e da galeria de flashes (NestJS + Prisma).

- **Porta:** `8083`
- **Banco:** `catalog` (PostgreSQL)
- **Swagger:** `http://localhost:8083/api/docs`
- **Rotas no Kong:** `/services`, `/galeries`, `GET /public/services`, `GET /public/galeries`

## Responsabilidades

- CRUD de serviços do tatuador (nome, duração, valor do sinal, ativo/inativo)
- Galeria de flashes vinculada a um serviço (estilo, tamanho, preço) — o tatuador cria, edita e exclui; a disponibilidade não é editável, o flash fica indisponível quando um cliente agenda um horário para ele

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
| `GET` | `/galeries/:id` | JWT | Busca um flash |
| `POST` | `/galeries` | JWT | Cria flash (`multipart`, com a imagem) |
| `PUT` | `/galeries/:id` | JWT | Atualiza título, tamanho, preço, estilo e serviço |
| `PUT` | `/galeries/:id/image` | JWT | Troca a imagem do flash |
| `DELETE` | `/galeries/:id` | JWT | Exclui o flash |
| `GET` | `/public/services` | — | Lista serviços públicos (`limit`, `offset`, `userId`), com cache |
| `GET` | `/public/galeries` | — | Lista flashes públicos (`limit`, `offset`, `userId`, `style`), com cache |
| `GET` | `/health` | — | Health check |

As rotas autenticadas operam só sobre os dados do usuário logado. As rotas `/public/*` usam o cache Redis de [`@bookink/shared/cache`](../../packages/shared/src/cache): 15 minutos de TTL e uma única requisição recarregando do banco perto de vencer. Cadastrar, editar ou excluir um flash invalida `/public/galeries`, e cadastrar, editar ou ativar/desativar um serviço invalida `/public/services`.

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

O evento carrega o estado completo do perfil. Eventos com `occurredAt` igual ou mais antigo que o `lastEventAt` salvo são ignorados (reentrega ou fora de ordem). Status desconhecido ou payload inválido vão para `catalog.user-events.dlq`.

## Modelos

- `Service` — `name`, `duration` (minutos), `depositAmount` (centavos), `status`
- `Galery` — `title`, `imageUrl`, `size`, `price`, `style` (`GaleryStyle`), `available`, pertence a um `Service`
- `Artist` — projeção somente leitura do perfil público do tatuador (`id` = id do user, `name`, `image`, `status`, `lastEventAt`), escrita só pelo consumer de `user.profile.updated`

Schema em [prisma/schema.prisma](prisma/schema.prisma).

## Arquitetura

```
src/
  domain/          # entidades Service e Galery e erros de domínio
  application/     # use cases + port do repositório
  infrastructure/  # Prisma, repositórios, mappers e gateway HTTP do plano
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
| `RABBITMQ_URL` | Conexão AMQP, para consumir `user.profile.updated` |
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
