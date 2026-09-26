# @bookink/shared

Código compartilhado entre os serviços NestJS. Consumido via workspace (`"@bookink/shared": "workspace:*"`), direto do TypeScript, sem build.

| Import | Conteúdo |
|---|---|
| `@bookink/shared/auth` | `JwtAuthModule`, `JwtAuthGuard`, decorator do payload do token e tipos de sessão. Só **valida** o JWT com `JWT_SECRET`; quem emite é o user-service |
| `@bookink/shared/common` | `FilterDto` (`limit`/`offset`) e DTO de resposta paginada |
| `@bookink/shared/storage` | `StorageModule` + adapter S3 (config via `S3_*`) e geração de object keys por tipo de asset |
| `@bookink/shared/mail` | `MailModule` + adapter nodemailer (config via `MAIL_*`) e template de email da marca |
