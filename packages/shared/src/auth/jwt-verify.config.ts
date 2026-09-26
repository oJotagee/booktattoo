import { registerAs } from '@nestjs/config';

export default registerAs('jwtVerify', () => ({
  secret: process.env.JWT_SECRET,
}));
