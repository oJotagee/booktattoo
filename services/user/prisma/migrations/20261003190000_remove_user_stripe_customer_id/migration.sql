/*
  stripeCustomerId foi movido para o payment-service (tabela "BillingCustomer").

  ATENÇÃO: esta migration apaga a coluna. Antes de rodar em um ambiente com
  clientes já criados no Stripe, copie o vínculo userId -> stripeCustomerId
  para o BillingCustomer do banco "payment".
*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeCustomerId";

