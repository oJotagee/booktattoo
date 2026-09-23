import { ASSET_TYPES, STORAGE_PORT, type StoragePort } from '@bookink/shared/storage';
import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';

type UpdateUserAvatarInput = {
  userId: string;
  filename: string;
  contentType: string;
  body: Buffer;
};

type UpdateUserAvatarOutput = {
  id: string;
  image: string;
  updatedAt: Date;
};

@Injectable()
export class UpdateUserAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
  ) {}

  async execute({
    userId,
    filename,
    contentType,
    body,
  }: UpdateUserAvatarInput): Promise<UpdateUserAvatarOutput> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const previousImage = user.image;

    const { url } = await this.storage.upload({
      assetType: ASSET_TYPES.AVATAR,
      ownerId: userId,
      filename,
      contentType,
      body,
    });

    const updatedUser = user.updateImage(url);
    await this.users.update(updatedUser);

    if (previousImage) {
      await this.deletePreviousAvatar(previousImage);
    }

    return {
      id: updatedUser.id,
      image: updatedUser.image as string,
      updatedAt: updatedUser.updatedAt,
    };
  }

  private async deletePreviousAvatar(previousImageUrl: string): Promise<void> {
    const key = this.extractKeyFromAvatarUrl(previousImageUrl);
    if (!key) return;

    try {
      await this.storage.delete(key);
    } catch {
      // Ignorado propositalmente: a troca de avatar já foi concluída com sucesso.
    }
  }

  private extractKeyFromAvatarUrl(url: string): string | null {
    const marker = `${ASSET_TYPES.AVATAR}/`;
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return null;

    return url.slice(markerIndex);
  }
}
