import type { DefaultSession } from 'next-auth';

import { UserStatus } from '@/app/(panel)/dashboard/_actions/update-status';

declare module 'next-auth' {
  interface Session {
    expires?: string;
    user: UserProps & DefaultSession['user'];
  }

  interface User extends UserProps { }
}

interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  address?: string | null;
  phone?: string | null;
  bio?: string | null;
  role?: string | null;
  status: UserStatus;
  times: string[];
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    address?: string | null;
    phone?: string | null;
    bio?: string | null;
    role?: string | null;
    status?: UserStatus;
    times?: string[];
  }
}
