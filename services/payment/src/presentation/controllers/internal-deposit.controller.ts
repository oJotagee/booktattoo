import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { CreateDepositCheckoutUseCase } from '@/application/use-cases/deposit/create-deposit-checkout.use-case';
import { CreateDepositCheckoutRequestDto } from '../dtos/deposit/create-deposit-checkout.request.dto';
import { DepositCheckoutResponseDto } from '../dtos/deposit/deposit-checkout.response.dto';
import { InternalApiSecretGuard } from '../guards/internal-api-secret.guard';

// Chamado só pelo appointment-service; a rota /internal não é exposta no Kong
@ApiExcludeController()
@Controller('internal/deposits')
@UseGuards(InternalApiSecretGuard)
export class InternalDepositController {
  constructor(private readonly createDepositCheckout: CreateDepositCheckoutUseCase) {}

  @Post('checkout')
  @HttpCode(200)
  checkout(@Body() body: CreateDepositCheckoutRequestDto): Promise<DepositCheckoutResponseDto> {
    return this.createDepositCheckout.execute(body);
  }
}
