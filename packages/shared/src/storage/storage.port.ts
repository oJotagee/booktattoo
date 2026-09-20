import type { AssetType } from './asset-type';

export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadFileInput {
  assetType: AssetType;
  ownerId: string;
  filename: string;
  body: Buffer | Uint8Array;
  contentType: string;
}

export interface UploadFileResult {
  key: string;
  url: string;
}

/**
 * Porta de storage de objetos, implementada por um adapter concreto
 * (hoje S3StorageAdapter). Cada serviço (user, appointment, ...) injeta
 * essa interface e nunca fala com o SDK do S3 diretamente.
 */
export interface StoragePort {
  upload(input: UploadFileInput): Promise<UploadFileResult>;

  delete(key: string): Promise<void>;

  /** URL assinada e temporária, para leitura de objetos privados. */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
