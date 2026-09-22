import { beforeEach, describe, expect, it } from 'bun:test';
import { buildUser } from '@tests/unit/support/builders';
import {
  createAccountRepositoryMock,
  createRefreshTokenRepositoryMock,
  createSessionTokenIssuerMock,
  createTokenGeneratorMock,
  createUserRepositoryMock,
} from '@tests/unit/support/mocks';
import { OAuthUpsertUseCase } from '@/application/use-cases/oauth-upsert.use-case';
import { AccountEntity } from '@/domain/entities/account.entity';

function buildAccount(overrides: Partial<{ userId: string; providerAccountId: string }> = {}) {
  return AccountEntity.create({
    userId: overrides.userId ?? 'user-1',
    type: 'oauth',
    provider: 'google',
    providerAccountId: overrides.providerAccountId ?? 'google-account-1',
  });
}

describe('OAuthUpsertUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let accounts: ReturnType<typeof createAccountRepositoryMock>;
  let tokenGenerator: ReturnType<typeof createTokenGeneratorMock>;
  let sessionTokenIssuer: ReturnType<typeof createSessionTokenIssuerMock>;
  let refreshTokens: ReturnType<typeof createRefreshTokenRepositoryMock>;
  let useCase: OAuthUpsertUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    accounts = createAccountRepositoryMock();
    tokenGenerator = createTokenGeneratorMock();
    sessionTokenIssuer = createSessionTokenIssuerMock();
    refreshTokens = createRefreshTokenRepositoryMock();
    useCase = new OAuthUpsertUseCase(
      users,
      accounts,
      tokenGenerator,
      sessionTokenIssuer,
      refreshTokens,
    );
  });

  it('reuses the linked user when the oauth account already exists', async () => {
    const user = buildUser({ id: 'user-1', email: 'john.doe@example.com' });
    const account = buildAccount({ userId: 'user-1' });
    accounts.findByProvider = async () => account;
    users.findById = async () => user;

    const result = await useCase.execute({
      provider: 'google',
      providerAccountId: 'google-account-1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      image: null,
    });

    expect(accounts.update).toHaveBeenCalledTimes(1);
    expect(users.create).not.toHaveBeenCalled();
    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('opaque-refresh-token');
  });

  it('keeps the stored avatar instead of the provider image when reusing an existing account', async () => {
    const user = buildUser({
      id: 'user-1',
      email: 'john.doe@example.com',
      image: 'https://booktattoo-assets.s3.us-east-2.amazonaws.com/avatars/user-1/photo.png',
    });
    const account = buildAccount({ userId: 'user-1' });
    accounts.findByProvider = async () => account;
    users.findById = async () => user;

    const result = await useCase.execute({
      provider: 'github',
      providerAccountId: 'github-account-1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      image: 'https://avatars.githubusercontent.com/u/1234',
    });

    expect(result.user.image).toBe(
      'https://booktattoo-assets.s3.us-east-2.amazonaws.com/avatars/user-1/photo.png',
    );
  });

  it('throws when the linked account points to a user that no longer exists', async () => {
    const account = buildAccount({ userId: 'orphan-user' });
    accounts.findByProvider = async () => account;
    users.findById = async () => null;

    await expect(
      useCase.execute({
        provider: 'google',
        providerAccountId: 'google-account-1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        image: null,
      }),
    ).rejects.toThrow(/Conta OAuth órfã/);
  });

  it('links the oauth account to an existing user found by email', async () => {
    const existingUser = buildUser({ id: 'user-1', email: 'john.doe@example.com' });
    accounts.findByProvider = async () => null;
    users.findByEmail = async () => existingUser;

    const result = await useCase.execute({
      provider: 'google',
      providerAccountId: 'google-account-1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      image: null,
    });

    expect(users.create).not.toHaveBeenCalled();
    expect(accounts.create).toHaveBeenCalledTimes(1);
    expect(result.user.id).toBe('user-1');
  });

  it('creates a new user and links the oauth account when no user is found', async () => {
    accounts.findByProvider = async () => null;
    users.findByEmail = async () => null;

    const result = await useCase.execute({
      provider: 'google',
      providerAccountId: 'google-account-1',
      email: 'new.user@example.com',
      name: 'New User',
      image: 'https://example.com/avatar.png',
    });

    expect(users.create).toHaveBeenCalledTimes(1);
    expect(accounts.create).toHaveBeenCalledTimes(1);
    expect(result.user.email).toBe('new.user@example.com');
    expect(result.user.name).toBe('New User');
    expect(result.user.image).toBe('https://example.com/avatar.png');
  });

  it('falls back to the email as the user name when no name is provided', async () => {
    accounts.findByProvider = async () => null;
    users.findByEmail = async () => null;

    const result = await useCase.execute({
      provider: 'google',
      providerAccountId: 'google-account-1',
      email: 'no-name@example.com',
      name: null,
      image: null,
    });

    expect(result.user.name).toBe('no-name@example.com');
  });
});
