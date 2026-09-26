# Book Tattoo

Micro-SaaS de agendamento para estúdios de tatuagem: cadastro/autenticação de usuários e marcação de horários (appointments), oferecido por assinatura mensal.

## Estrutura do projeto

Monorepo gerenciado com Bun workspaces:

```
frontend/             # Aplicação web (Next.js)
services/user/        # API de usuários e autenticação (NestJS) — :8081
services/catalog/     # API de serviços e galeria (NestJS) — :8083
services/appointment/ # API de agendamentos (NestJS) — :8082
packages/shared/       # DTOs e utilitários compartilhados entre os serviços
docker/                # Configurações auxiliares (Postgres, Kong)
```

O frontend fala só com o **API gateway (Kong)** em `http://localhost:8000`, que roteia pelo prefixo da rota (config em [docker/kong/kong.yml](docker/kong/kong.yml)):

| Rota | Serviço |
|---|---|
| `/auth`, `/users` | user |
| `/services`, `/galeries` | catalog |
| `/appointments`, `/booking-requests`, `/reminders` | appointment |

O Swagger de cada serviço fica direto na porta dele: `http://localhost:<porta>/api/docs`.

## Stack

- **Frontend:** Next.js
- **Backend:** NestJS + Prisma
- **Banco de dados:** PostgreSQL
- **CMS:** Strapi (gestão do catálogo de planos de assinatura)
- **Gerenciador de pacotes:** Bun
- **Lint/format:** Biome

## Como rodar

Pré-requisitos: [Bun](https://bun.sh) e Docker instalados.

```bash
# instalar dependências
bun install

# subir Postgres, RabbitMQ, serviços e Kong em containers
bun run docker:up

# ou, para ambiente de desenvolvimento (Postgres, RabbitMQ e Kong)
bun run docker:dev:up
# ...e cada serviço na máquina, com hot reload
bun run --cwd services/user dev
bun run --cwd services/catalog dev
bun run --cwd services/appointment dev
```

No dev, o Kong roda no Docker e alcança os serviços na sua máquina via `extra_hosts` (`host-gateway`), então o mesmo `kong.yml` serve para os dois composes.

Outros comandos úteis estão em [package.json](package.json), como `lint`, `test:unit` e os comandos `prisma:*` para migrations de cada serviço.

## Modelo de negócio

O produto será oferecido como assinatura mensal, com planos gerenciados via Strapi (CMS externo ao core da aplicação).

## Status

Projeto em desenvolvimento inicial. Prioridade atual: fluxo de usuários (cadastro/login) e agendamento básico. Integração com Strapi (catálogo de planos) e cobrança recorrente ficam para uma fase posterior.
