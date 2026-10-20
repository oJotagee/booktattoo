import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { UserStatus } from '@/app/(panel)/dashboard/_actions/update-status';

interface UseProfileSchemaProps {
  name: string;
  address: string | null;
  showAddress: boolean;
  phone: string | null;
  bio: string | null;
  role: string | null;
  status: UserStatus;
}

export const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string(),
  showAddress: z.boolean(),
  phone: z.string(),
  bio: z.string(),
  role: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'VACATION']),
});

export type ProfileSchemaData = z.infer<typeof profileSchema>;

export function useProfileSchema({
  name,
  address,
  showAddress,
  phone,
  bio,
  role,
  status,
}: UseProfileSchemaProps) {
  return useForm<ProfileSchemaData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: name || '',
      address: address || '',
      showAddress,
      phone: phone || '',
      bio: bio || '',
      role: role || '',
      status,
    },
  });
}
