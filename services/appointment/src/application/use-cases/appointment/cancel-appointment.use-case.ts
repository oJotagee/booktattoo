import { createEventEnvelope, EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  APPOINTMENT_NOTIFIER,
  type AppointmentNotifier,
} from '../../port/appointment-notifier.port';
import { DEPOSIT_GATEWAY, type DepositGateway } from '../../port/deposit-gateway.port';
import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import { blockedTimesCacheNamespace } from '@/application/cache/public-cache';
import { AppointmentNotFoundError } from '@/domain/errors/appointment.error';

@Injectable()
export class CancelAppointmentUseCase {
  private readonly logger = new Logger(CancelAppointmentUseCase.name);

  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
    @Inject(DEPOSIT_GATEWAY)
    private readonly deposits: DepositGateway,
    @Inject(APPOINTMENT_NOTIFIER)
    private readonly notifier: AppointmentNotifier,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const appointment = await this.appointments.findById(id);
    if (!appointment) throw new AppointmentNotFoundError(id);

    if (appointment.userId !== userId) throw new ForbiddenResourceAccessError();

    let cancelled = appointment.cancel();

    if (appointment.isRefundable && appointment.checkoutSessionId) {
      const { refundId } = await this.deposits.refund({
        appointmentId: appointment.id,
        checkoutSessionId: appointment.checkoutSessionId,
      });

      cancelled = cancelled.recordRefund(refundId, new Date());
    } else if (appointment.isPending && appointment.checkoutSessionId) {
      await this.expireCheckout(appointment.id, appointment.checkoutSessionId);
    }

    await this.appointments.update(cancelled);
    await this.cache.invalidate(blockedTimesCacheNamespace(appointment.userId));

    await this.publisher.publish(
      createEventEnvelope(
        'appointment.cancelled',
        {
          appointmentId: appointment.id,
          artistId: appointment.userId,
          galeryId: appointment.galeryId,
        },
        { correlationId: appointment.id },
      ),
    );

    if (cancelled.refundedAt) await this.notifier.cancelledWithRefund(cancelled);
  }

  private async expireCheckout(appointmentId: string, checkoutSessionId: string): Promise<void> {
    try {
      await this.deposits.expireCheckout(checkoutSessionId);
    } catch (error) {
      this.logger.warn(
        `Falha ao expirar o checkout ${checkoutSessionId} do agendamento ${appointmentId}: ${(error as Error).message}`,
      );
    }
  }
}
