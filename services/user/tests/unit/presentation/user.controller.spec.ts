import { describe, expect, it, mock } from 'bun:test';

import type { PayloadSession } from '@/application/port/session-token-issuer.port';
import { UserStatus } from '@/domain/entities/user.entity';
import { UserController } from '@/presentation/controllers/user.controller';

function buildController() {
  const findUserById = { execute: mock(async () => ({ id: 'user-1' })) };
  const updateUserContactInfo = { execute: mock(async () => ({ id: 'user-1' })) };
  const updateUserStatus = { execute: mock(async () => ({ id: 'user-1', status: 'ACTIVE' })) };
  const updateUserAvatar = {
    execute: mock(async () => ({ id: 'user-1', image: 'https://bucket/avatars/user-1/file.png' })),
  };

  const controller = new UserController(
    findUserById as never,
    updateUserContactInfo as never,
    updateUserStatus as never,
    updateUserAvatar as never,
  );

  return { controller, findUserById, updateUserContactInfo, updateUserStatus, updateUserAvatar };
}

const payload: PayloadSession = { sub: 'user-1', email: 'john.doe@example.com' };

describe('UserController', () => {
  it('delegates fetching the current user to FindUserByIdUseCase', async () => {
    const { controller, findUserById } = buildController();

    await controller.me(payload);

    expect(findUserById.execute).toHaveBeenCalledWith({ id: payload.sub });
  });

  it('delegates updating contact info to UpdateUserContactInfoUseCase', async () => {
    const { controller, updateUserContactInfo } = buildController();
    const body = { name: 'Jane Doe' };

    await controller.updateMe(payload, body);

    expect(updateUserContactInfo.execute).toHaveBeenCalledWith({ userId: payload.sub, ...body });
  });

  it('delegates updating the status to UpdateUserStatusUseCase', async () => {
    const { controller, updateUserStatus } = buildController();
    const body = { status: UserStatus.INACTIVE };

    await controller.updateMyStatus(payload, body);

    expect(updateUserStatus.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      status: body.status,
    });
  });

  it('delegates updating the avatar to UpdateUserAvatarUseCase', async () => {
    const { controller, updateUserAvatar } = buildController();
    const file = {
      originalname: 'photo.png',
      mimetype: 'image/png',
      buffer: Buffer.from('fake-image-content'),
    } as Express.Multer.File;

    await controller.updateMyAvatar(payload, file);

    expect(updateUserAvatar.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      filename: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
    });
  });

  it('rejects avatar uploads with unsupported mime types', async () => {
    const { controller, updateUserAvatar } = buildController();
    const file = {
      originalname: 'malware.exe',
      mimetype: 'application/x-msdownload',
      buffer: Buffer.from('not-an-image'),
    } as Express.Multer.File;

    await expect(controller.updateMyAvatar(payload, file)).rejects.toThrow();
    expect(updateUserAvatar.execute).not.toHaveBeenCalled();
  });
});
