import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateServiceUseCase } from '@/application/use-cases/service/create-service.use-case';
import { PlanExpiredError, PlanLimitReachedError } from '@/domain/errors/plan.error';
import {
  createCacheMock,
  createPlanAccessGatewayMock,
  createServiceRepositoryMock,
} from '@tests/unit/support/mocks';

const input = {
  userId: 'user-1',
  authorization: 'Bearer access-token',
  name: 'Tatuagem Fineline',
  duration: 60,
  depositAmount: 5000,
};

describe('CreateServiceUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let planAccess: ReturnType<typeof createPlanAccessGatewayMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: CreateServiceUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    planAccess = createPlanAccessGatewayMock();
    cache = createCacheMock();
    useCase = new CreateServiceUseCase(services, planAccess, cache);
  });

  it('creates a service active by default for the given user', async () => {
    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      userId: 'user-1',
      name: 'Tatuagem Fineline',
      duration: 60,
      depositAmount: 5000,
      status: true,
    });
    expect(cache.invalidate).toHaveBeenCalledWith('catalog:public:services');
  });

  it('checks the plan with the caller authorization', async () => {
    await useCase.execute(input);

    expect(planAccess.getPlanAccess).toHaveBeenCalledWith('Bearer access-token');
    expect(services.countByUserId).toHaveBeenCalledWith('user-1');
    expect(services.create).toHaveBeenCalledTimes(1);
  });

  it('allows creating a service with the same name as an existing one', async () => {
    const first = await useCase.execute(input);
    const second = await useCase.execute({ ...input, duration: 90, depositAmount: 7000 });

    expect(first.name).toBe(second.name);
    expect(services.create).toHaveBeenCalledTimes(2);
  });

  it('throws PlanLimitReachedError when the plan limit was reached', async () => {
    planAccess.getPlanAccess = async () => ({
      status: 'ACTIVE',
      limits: { services: 3, galeries: 5 },
    });
    services.countByUserId = async () => 3;

    await expect(useCase.execute(input)).rejects.toThrow(PlanLimitReachedError);
    expect(services.create).not.toHaveBeenCalled();
  });

  it('throws PlanExpiredError when the trial expired without subscription', async () => {
    planAccess.getPlanAccess = async () => ({ status: 'EXPIRED', limits: null });

    await expect(useCase.execute(input)).rejects.toThrow(PlanExpiredError);
    expect(services.create).not.toHaveBeenCalled();
  });
});
