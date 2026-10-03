# Build context = raiz do monorepo:
#   docker build -f services/payment/Dockerfile -t bookink-payment .

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
COPY services/catalog/package.json ./services/catalog/
COPY services/appointment/package.json ./services/appointment/
COPY services/payment/package.json ./services/payment/

RUN bun install --frozen-lockfile --ignore-scripts

COPY tsconfig.json ./
COPY services/payment/prisma.config.ts ./services/payment/
COPY services/payment/prisma ./services/payment/prisma

RUN bunx prisma generate --config services/payment/prisma.config.ts

# ============================
# STAGE 2 - RUNTIME
# ============================
FROM oven/bun:1.4.2-slim AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8084

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY services/user/package.json ./services/user/
COPY services/catalog/package.json ./services/catalog/
COPY services/appointment/package.json ./services/appointment/
COPY services/payment/package.json ./services/payment/

RUN bun install --frozen-lockfile --production --ignore-scripts

# Bun executa TypeScript direto — não há etapa de compilação
COPY packages/shared ./packages/shared
COPY services/payment/tsconfig.json ./services/payment/
COPY services/payment/src ./services/payment/src
COPY --from=builder /usr/src/app/services/payment/generated ./services/payment/generated

WORKDIR /usr/src/app/services/payment

USER bun

EXPOSE 8084

CMD ["bun", "run", "src/main.ts"]
