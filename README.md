# Book Tattoo

Micro-SaaS de agendamento para estúdios de tatuagem: cadastro/autenticação de usuários e marcação de horários (appointments), oferecido por assinatura mensal.

## Estrutura do projeto

Monorepo gerenciado com Bun workspaces:

```
frontend/             # Aplicação web (Next.js)
services/user/        # API de usuários e autenticação (NestJS)
services/appointment/ # API de agendamentos (NestJS)
packages/shared/       # DTOs e utilitários compartilhados entre os serviços
docker/                # Configurações auxiliares (ex.: Postgres)
```

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

# subir Postgres e serviços em containers
bun run docker:up

# ou, para ambiente de desenvolvimento (apenas infra, ex. banco)
bun run docker:dev:up
```

Outros comandos úteis estão em [package.json](package.json), como `lint`, `test:unit` e os comandos `prisma:*` para migrations de cada serviço.

## Modelo de negócio

O produto será oferecido como assinatura mensal, com planos gerenciados via Strapi (CMS externo ao core da aplicação).

## Status

Projeto em desenvolvimento inicial. Prioridade atual: fluxo de usuários (cadastro/login) e agendamento básico. Integração com Strapi (catálogo de planos) e cobrança recorrente ficam para uma fase posterior.
