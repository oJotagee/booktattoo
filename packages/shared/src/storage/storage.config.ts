import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  region: process.env.S3_REGION,
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
}));
