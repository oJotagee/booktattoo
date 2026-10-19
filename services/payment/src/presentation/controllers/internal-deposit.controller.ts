import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { ExpireDepositCheckoutUseCase } from '@/application/use-cases/deposit/expire-deposit-checkout.use-case';
import { CreateDepositCheckoutUseCase } from '@/application/use-cases/deposit/create-deposit-checkout.use-case';
import { RefundDepositUseCase } from '@/application/use-cases/deposit/refund-deposit.use-case';
import { ExpireDepositCheckoutRequestDto } from '../dtos/deposit/expire-deposit-checkout.request.dto';
import { CreateDepositCheckoutRequestDto } from '../dtos/deposit/create-deposit-checkout.request.dto';
import { DepositCheckoutResponseDto } from '../dtos/deposit/deposit-checkout.response.dto';
import { RefundDepositResponseDto } from '../dtos/deposit/refund-deposit.response.dto';
import { RefundDepositRequestDto } from '../dtos/deposit/refund-deposit.request.dto';
import { InternalApiSecretGuard } from '../guards/internal-api-secret.guard';

// Chamado só pelo appointment-service; a rota /internal não é exposta no Kong
@ApiExcludeController()
@Controller('internal/deposits')
@UseGuards(InternalApiSecretGuard)
export class InternalDepositController {
  constructor(
    private readonly createDepositCheckout: CreateDepositCheckoutUseCase,
    private readonly refundDeposit: RefundDepositUseCase,
    private readonly expireDepositCheckout: ExpireDepositCheckoutUseCase,
  ) {}

  @Post('checkout')
  @HttpCode(200)
  checkout(@Body() body: CreateDepositCheckoutRequestDto): Promise<DepositCheckoutResponseDto> {
    return this.createDepositCheckout.execute(body);
  }

  @Post('refund')
  @HttpCode(200)
  refund(@Body() body: RefundDepositRequestDto): Promise<RefundDepositResponseDto> {
    return this.refundDeposit.execute(body);
  }

  @Post('expire')
  @HttpCode(204)
  expire(@Body() body: ExpireDepositCheckoutRequestDto): Promise<void> {
    return this.expireDepositCheckout.execute(body);
  }
}
