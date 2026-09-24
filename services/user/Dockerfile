# Build context = raiz do monorepo:
#   docker build -f services/user/Dockerfile -t bookink-user .

# ============================
# STAGE 1 - BUILD
# ============================
FROM oven/bun:1.4.2-slim AS builder

WORKDIR /usr/src/app

# prisma generate não conecta no banco, mas o prisma.config.ts lê a variável
ENV DATABASE_URL="postgresql://user:password@localhost:5432/dummy"

# Só os manifests primeiro, pra aproveitar cache do bun install
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY services/user/package.json ./services/user/
COPY services/appointment/package.json ./services/appointment/

RUN bun install --frozen-lockfile --ignore-scripts

COPY tsconfig.json ./
COPY services/user/prisma.config.ts ./services/user/
COPY services/user/prisma ./services/user/prisma

RUN bunx prisma generate --config services/user/prisma.config.ts

# ============================
# STAGE 2 - RUNTIME
# ============================
FROM oven/bun:1.4.2-slim AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8081

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY services/user/package.json ./services/user/
COPY services/appointment/package.json ./services/appointment/

RUN bun install --frozen-lockfile --production --ignore-scripts

# Bun executa TypeScript direto — não há etapa de compilação
COPY packages/shared ./packages/shared
COPY services/user/tsconfig.json ./services/user/
COPY services/user/src ./services/user/src
COPY --from=builder /usr/src/app/services/user/generated ./services/user/generated

WORKDIR /usr/src/app/services/user

USER bun

EXPOSE 8081

CMD ["bun", "run", "src/main.ts"]
