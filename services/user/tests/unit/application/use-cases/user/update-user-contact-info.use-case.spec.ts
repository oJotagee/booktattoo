import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateUserContactInfoUseCase } from '@/application/use-cases/user/update-user-contact-info.use-case';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import {
  createCacheMock,
  createUserRepositoryMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

describe('UpdateUserContactInfoUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: UpdateUserContactInfoUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    cache = createCacheMock();
    publisher = createEventPublisherMock();
    useCase = new UpdateUserContactInfoUseCase(users, cache, publisher);
  });

  it('updates the contact info of an existing user', async () => {
    const user = buildUser({ id: 'user-1', name: 'John Doe' });
    users.findById = async () => user;
    users.update = async () => undefined;

    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Jane Doe',
      phone: '+55 11 99999-0000',
      bio: 'Updated bio',
    });

    expect(result).toMatchObject({
      id: 'user-1',
      name: 'Jane Doe',
      phone: '+55 11 99999-0000',
      bio: 'Updated bio',
    });
    expect(cache.invalidate).toHaveBeenCalledWith('user:public:artists');
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it('keeps existing fields untouched when not provided', async () => {
    const user = buildUser({ id: 'user-1', name: 'John Doe', address: 'Original Address' });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: 'user-1', bio: 'Just a bio update' });

    expect(result.name).toBe('John Doe');
    expect(result.address).toBe('Original Address');
    expect(result.bio).toBe('Just a bio update');
  });

  it('lets the artist opt in and out of showing the studio address', async () => {
    users.findById = async () => buildUser({ id: 'user-1', address: 'Rua Exemplo, 123' });

    const optedIn = await useCase.execute({ userId: 'user-1', showAddress: true });
    expect(optedIn.showAddress).toBe(true);

    users.findById = async () =>
      buildUser({ id: 'user-1', address: 'Rua Exemplo, 123', showAddress: true });

    const optedOut = await useCase.execute({ userId: 'user-1', showAddress: false });
    expect(optedOut.showAddress).toBe(false);
  });

  it('keeps the address visibility when not provided', async () => {
    users.findById = async () => buildUser({ id: 'user-1', showAddress: true });

    const result = await useCase.execute({ userId: 'user-1', bio: 'Just a bio update' });

    expect(result.showAddress).toBe(true);
  });

  it('updates the role as free text supplied by the user', async () => {
    const user = buildUser({ id: 'user-1' });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: 'user-1', role: 'Tradicional & Neo' });

    expect(result.role).toBe('Tradicional & Neo');
  });

  it('keeps the existing role when not provided', async () => {
    const user = buildUser({ id: 'user-1', role: 'Tradicional & Neo' });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: 'user-1', bio: 'Just a bio update' });

    expect(result.role).toBe('Tradicional & Neo');
  });

  it('throws UserNotFoundError when the user does not exist', async () => {
    users.findById = async () => null;

    await expect(useCase.execute({ userId: 'missing-user', name: 'Jane Doe' })).rejects.toThrow(
      UserNotFoundError,
    );
  });
});
