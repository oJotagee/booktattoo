import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { UserStatus } from "@/app/(panel)/dashboard/_actions/update-status"

interface UseProfileSchemaProps {
  name: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  status: UserStatus;
}

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  image: z.string().nullable(),
  address: z.string(),
  phone: z.string(),
  bio: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "VACATION"]),
});

export type ProfileSchemaData = z.infer<typeof profileSchema>

export function useProfileSchema({ name, image, address, phone, bio, status }: UseProfileSchemaProps) {
  return useForm<ProfileSchemaData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: name || "",
      image,
      address: address || "",
      phone: phone || "",
      bio: bio || "",
      status,
    },
  });
}