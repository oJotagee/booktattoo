import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateUserContactInfoUseCase } from '@/application/use-cases/user/update-user-contact-info.use-case';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { buildUser } from '@tests/unit/support/builders';
import { createUserRepositoryMock } from '@tests/unit/support/mocks';

describe('UpdateUserContactInfoUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let useCase: UpdateUserContactInfoUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    useCase = new UpdateUserContactInfoUseCase(users);
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
  });

  it('keeps existing fields untouched when not provided', async () => {
    const user = buildUser({ id: 'user-1', name: 'John Doe', address: 'Original Address' });
    users.findById = async () => user;

    const result = await useCase.execute({ userId: 'user-1', bio: 'Just a bio update' });

    expect(result.name).toBe('John Doe');
    expect(result.address).toBe('Original Address');
    expect(result.bio).toBe('Just a bio update');
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
