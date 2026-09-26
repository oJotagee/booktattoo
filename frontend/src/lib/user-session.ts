import { UserStatus } from '@/app/(panel)/dashboard/_actions/update-status';

export type UserServiceSession = {
  accessToken: string;
  refreshToken: string;
  user: {
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
  };
};
