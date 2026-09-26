import { describe, expect, it } from 'bun:test';

import { ServiceEntity } from '@/domain/entities/service.entity';
import { InvalidServiceError, ServiceAlreadyInStatusError } from '@/domain/errors/service.error';

function buildService() {
  return ServiceEntity.create({
    id: 'service-1',
    name: 'Tatuagem Fineline',
    duration: 60,
    depositAmount: 5000,
    userId: 'user-1',
  });
}

describe('ServiceEntity', () => {
  it('creates a service active by default with timestamps', () => {
    const service = buildService();

    expect(service.id).toBe('service-1');
    expect(service.status).toBe(true);
    expect(service.createdAt).toBeInstanceOf(Date);
    expect(service.updatedAt).toBeInstanceOf(Date);
  });

  it('throws InvalidServiceError when id is empty', () => {
    expect(() =>
      ServiceEntity.create({
        id: '  ',
        name: 'Tatuagem Fineline',
        duration: 60,
        depositAmount: 5000,
        userId: 'user-1',
      }),
    ).toThrow(InvalidServiceError);
  });

  it('throws InvalidServiceError when name is empty', () => {
    expect(() =>
      ServiceEntity.create({
        id: 'service-1',
        name: '   ',
        duration: 60,
        depositAmount: 5000,
        userId: 'user-1',
      }),
    ).toThrow(InvalidServiceError);
  });

  it('updates info keeping unspecified fields unchanged', () => {
    const service = buildService();

    const updated = service.updateInfo({ duration: 90 });

    expect(updated.duration).toBe(90);
    expect(updated.name).toBe(service.name);
    expect(updated.depositAmount).toBe(service.depositAmount);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(service.updatedAt.getTime());
  });

  it('activates an inactive service', () => {
    const service = buildService().deactivate();

    const activated = service.activate();

    expect(activated.status).toBe(true);
  });

  it('throws ServiceAlreadyInStatusError when activating an already active service', () => {
    const service = buildService();

    expect(() => service.activate()).toThrow(ServiceAlreadyInStatusError);
  });

  it('deactivates an active service', () => {
    const service = buildService();

    const deactivated = service.deactivate();

    expect(deactivated.status).toBe(false);
  });

  it('throws ServiceAlreadyInStatusError when deactivating an already inactive service', () => {
    const service = buildService().deactivate();

    expect(() => service.deactivate()).toThrow(ServiceAlreadyInStatusError);
  });

  it('exposes a safe JSON representation', () => {
    const service = buildService();

    const json = service.toSafeJSON();

    expect(json.name).toBe('Tatuagem Fineline');
    expect(json.userId).toBe('user-1');
  });
});
