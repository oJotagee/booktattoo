import { describe, expect, it } from 'bun:test';

import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import { InvalidUserError, UserAlreadyInStatusError } from '@/domain/errors/user.error';
import { Email } from '@/domain/value-objects/email.vo';

function buildUser(status: UserStatus = UserStatus.ACTIVE) {
  return UserEntity.create({
    id: 'user-1',
    name: 'John Doe',
    email: Email.create({ value: 'john.doe@example.com' }),
    image: null,
    address: null,
    phone: null,
    bio: null,
    role: null,
    status,
    times: [],
    stripeCustomerId: null,
  });
}

describe('UserEntity', () => {
  it('creates a user with default status and timestamps', () => {
    const user = buildUser();

    expect(user.id).toBe('user-1');
    expect(user.status).toBe(UserStatus.ACTIVE);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('throws InvalidUserError when id is empty', () => {
    expect(() =>
      UserEntity.create({
        id: '  ',
        name: 'John Doe',
        email: Email.create({ value: 'john.doe@example.com' }),
        image: null,
        address: null,
        phone: null,
        bio: null,
        role: null,
        status: UserStatus.ACTIVE,
        times: [],
        stripeCustomerId: null,
      }),
    ).toThrow(InvalidUserError);
  });

  it('throws InvalidUserError when name is empty', () => {
    expect(() =>
      UserEntity.create({
        id: 'user-1',
        name: '   ',
        email: Email.create({ value: 'john.doe@example.com' }),
        image: null,
        address: null,
        phone: null,
        bio: null,
        role: null,
        status: UserStatus.ACTIVE,
        times: [],
        stripeCustomerId: null,
      }),
    ).toThrow(InvalidUserError);
  });

  it('updates contact info keeping unspecified fields unchanged', () => {
    const user = buildUser();

    const updated = user.updateContactInfo({ phone: '+55 11 99999-0000' });

    expect(updated.phone).toBe('+55 11 99999-0000');
    expect(updated.name).toBe(user.name);
    expect(updated.role).toBe(user.role);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
  });

  it('defaults role to null when not provided on creation', () => {
    const user = buildUser();

    expect(user.role).toBeNull();
  });

  it('updates the role via updateContactInfo', () => {
    const user = buildUser();

    const updated = user.updateContactInfo({ role: 'Tradicional & Neo' });

    expect(updated.role).toBe('Tradicional & Neo');
  });

  it('keeps the existing role when updateContactInfo does not include it', () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'John Doe',
      email: Email.create({ value: 'john.doe@example.com' }),
      image: null,
      address: null,
      phone: null,
      bio: null,
      role: 'Tradicional & Neo',
      status: UserStatus.ACTIVE,
      times: [],
      stripeCustomerId: null,
    });

    const updated = user.updateContactInfo({ name: 'Jane Doe' });

    expect(updated.role).toBe('Tradicional & Neo');
  });

  it('activates an inactive user', () => {
    const user = buildUser(UserStatus.INACTIVE);

    const activated = user.activate();

    expect(activated.status).toBe(UserStatus.ACTIVE);
  });

  it('throws UserAlreadyInStatusError when activating an already active user', () => {
    const user = buildUser(UserStatus.ACTIVE);

    expect(() => user.activate()).toThrow(UserAlreadyInStatusError);
  });

  it('deactivates an active user', () => {
    const user = buildUser(UserStatus.ACTIVE);

    const deactivated = user.deactivate();

    expect(deactivated.status).toBe(UserStatus.INACTIVE);
  });

  it('throws UserAlreadyInStatusError when deactivating an already inactive user', () => {
    const user = buildUser(UserStatus.INACTIVE);

    expect(() => user.deactivate()).toThrow(UserAlreadyInStatusError);
  });

  it('sets an active user on vacation', () => {
    const user = buildUser(UserStatus.ACTIVE);

    const onVacation = user.setOnVacation();

    expect(onVacation.status).toBe(UserStatus.VACATION);
  });

  it('throws UserAlreadyInStatusError when the user is already on vacation', () => {
    const user = buildUser(UserStatus.VACATION);

    expect(() => user.setOnVacation()).toThrow(UserAlreadyInStatusError);
  });

  it('exposes a safe JSON representation without the password hash', () => {
    const user = buildUser();

    const json = user.toSafeJSON();

    expect(json.email).toBe('john.doe@example.com');
    expect(json.role).toBeNull();
    expect(json).not.toHaveProperty('passwordHash');
  });
});
