import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Galery } from '../_data-access/get-all-galeries';
import { GALERY_STYLES } from '@/utils/formatGalery';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const imageSchema = z
  .instanceof(File, { error: 'Envie a imagem da arte' })
  .refine((file) => ALLOWED_IMAGE_MIME_TYPES.includes(file.type), 'Use JPG, PNG ou WEBP')
  .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, 'A imagem deve ter no máximo 5 MB');

export function createGalerySchema(isEditing: boolean) {
  return z.object({
    image: isEditing ? imageSchema.optional() : imageSchema,
    title: z.string().trim().min(1, 'Nome é obrigatório'),
    style: z.enum(GALERY_STYLES, { error: 'Selecione um estilo' }),
    size: z.string().trim().min(1, 'Tamanho é obrigatório'),
    serviceId: z.string().min(1, 'Selecione o serviço vinculado'),
    price: z.number().int().positive('Informe o preço do flash'),
  });
}

export type GalerySchemaData = z.infer<ReturnType<typeof createGalerySchema>>;

export function useGalerySchema(galery?: Galery | null) {
  return useForm<GalerySchemaData>({
    resolver: zodResolver(createGalerySchema(!!galery)),
    defaultValues: {
      image: undefined,
      title: galery?.title ?? '',
      style: galery?.style ?? 'TRADICIONAL',
      size: galery?.size ?? '',
      serviceId: galery?.serviceId ?? '',
      price: galery?.price ?? 0,
    },
  });
}
