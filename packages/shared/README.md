# @bookink/shared

Código compartilhado entre os serviços NestJS. Consumido via workspace (`"@bookink/shared": "workspace:*"`), direto do TypeScript, sem build.

| Import | Conteúdo |
|---|---|
| `@bookink/shared/auth` | `JwtAuthModule`, `JwtAuthGuard`, decorator do payload do token e tipos de sessão. Só **valida** o JWT com `JWT_SECRET`; quem emite é o user-service |
| `@bookink/shared/common` | `FilterDto` (`limit`/`offset`) e DTO de resposta paginada |
| `@bookink/shared/storage` | `StorageModule` + adapter S3 (config via `S3_*`) e geração de object keys por tipo de asset. A URL pública usa `S3_PUBLIC_BASE_URL` (o domínio do CloudFront em produção), e todo upload grava `Cache-Control: public, max-age=31536000, immutable`, porque cada chave é única |
| `@bookink/shared/cache` | `CacheModule` + adapter Redis (config via `REDIS_URL` e `CACHE_*`). `getOrLoad(namespace, key, loader)` guarda o resultado por `CACHE_TTL_SECONDS` e, perto de vencer, deixa uma única requisição recarregar enquanto as outras esperam. `invalidate(namespace)` descarta todas as chaves do namespace. Sem Redis, chama o `loader` direto. O mesmo módulo exporta o `AttemptLimiter` (`ATTEMPT_LIMITER`), um contador de tentativas por chave e janela (`consume`, `peek`, `reset`), usado no bloqueio de login e no intervalo do esqueci a senha. Sem Redis, ele libera a tentativa |
| `@bookink/shared/mail` | `MailModule` + adapter nodemailer (config via `MAIL_*`) e template de email da marca |
| `@bookink/shared/events` | `MessagingModule` + conexão RabbitMQ (config via `RABBITMQ_URL`): `publish` na exchange topic `bookink.events` e `subscribe` com uma fila por consumidor e DLQ. Também os contratos dos eventos: `payment.subscription.*`, `payment.deposit.*`, `appointment.*` e `user.profile.*` |
| `@bookink/shared/http` | `UnhandledExceptionFilter`: repassa as `HttpException` 4xx como vieram e responde os erros 5xx com uma mensagem genérica, logando o erro sem vazar detalhes internos |
