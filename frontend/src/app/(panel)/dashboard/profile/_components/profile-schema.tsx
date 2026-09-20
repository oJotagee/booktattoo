import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { UserStatus } from "@/app/(panel)/dashboard/_actions/update-status"

interface UseProfileSchemaProps {
  name: string;
  address: string | null;
  phone: string | null;
  bio: string | null;
  role: string | null;
  status: UserStatus;
}

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string(),
  phone: z.string(),
  bio: z.string(),
  role: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "VACATION"]),
});

export type ProfileSchemaData = z.infer<typeof profileSchema>

export function useProfileSchema({ name, address, phone, bio, role, status }: UseProfileSchemaProps) {
  return useForm<ProfileSchemaData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: name || "",
      address: address || "",
      phone: phone || "",
      bio: bio || "",
      role: role || "",
      status,
    },
  });
}