'use client';

import { ArrowRight, Camera, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from 'cn';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { UserStatus } from '@/app/(panel)/dashboard/_actions/update-status';
import { type ProfileSchemaData, useProfileSchema } from './schemas';
import { updateProfile } from '../_actions/update-profile';
import { updateAvatar } from '../_actions/update-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatPhone } from '@/utils/formatPhone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ProfileFormProps {
  user: {
    name: string;
    image: string | null;
    address: string | null;
    phone: string | null;
    bio: string | null;
    role: string | null;
    times: string[] | null;
    status: UserStatus;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { data: session, update } = useSession();

  const currentUser = {
    name: session?.user?.name ?? user.name,
    image: session?.user?.image ?? user.image,
    address: session?.user?.address ?? user.address,
    phone: session?.user?.phone ?? user.phone,
    bio: session?.user?.bio ?? user.bio,
    role: session?.user?.role ?? user.role,
    times: session?.user?.times ?? user.times,
    status: (session?.user?.status as UserStatus) ?? user.status,
  };

  const profileSchema = useProfileSchema({
    name: currentUser.name,
    address: currentUser.address,
    phone: currentUser.phone,
    bio: currentUser.bio,
    role: currentUser.role,
    status: currentUser.status,
  });

  const [selectedHour, setSelectedHour] = useState<string[]>(currentUser.times || []);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = currentUser.name;
  const displayImage = avatarPreview ?? currentUser.image;

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  const { mutateAsync: updateAvatarMutation, isPending: isUploadingAvatar } = useMutation({
    mutationFn: updateAvatar,
  });

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      toast.error('Formato de imagem não suportado. Use JPEG, PNG ou WEBP.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const formData = new FormData();
    formData.append('file', file);

    const response = await updateAvatarMutation(formData);

    if (response.error) {
      toast.error(response.error);
      setAvatarPreview(null);
      return;
    }

    toast.promise(update({ image: response.data?.image }), {
      loading: 'Atualizando foto de perfil...',
      success: 'Foto de perfil atualizada com sucesso',
      error: 'Não foi possível atualizar a foto de perfil',
    });

    // await update({ image: response.data?.image });
    // setAvatarPreview(null);
  }

  const { mutateAsync: updateProfileMutation, isPending: isSubmitting } = useMutation({
    mutationFn: updateProfile,
  });

  function generateTimeSlots(): string[] {
    const hours: string[] = [];

    for (let hour = 8; hour <= 24; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');

      for (let minutes = 0; minutes < 2; minutes++) {
        const formattedMinutes = (minutes * 30).toString().padStart(2, '0');

        hours.push(`${formattedHour}:${formattedMinutes}`);
      }
    }

    return hours;
  }

  const hours = generateTimeSlots();

  function toggleHour(hour: string) {
    setSelectedHour((prev) => {
      return prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour].sort();
    });
  }

  async function onSubmit(values: ProfileSchemaData) {
    const response = await updateProfileMutation({
      name: values.name,
      address: values.address,
      phone: values.phone,
      bio: values.bio,
      role: values.role,
      times: selectedHour || [],
    });

    if (response.error) {
      toast.error(response.error);
      return;
    }

    // await update({
    //   name: response.data?.name,
    //   image: response.data?.image,
    //   address: response.data?.address,
    //   phone: response.data?.phone,
    //   bio: response.data?.bio,
    //   times: response.data?.times,
    // });
    // toast.success('Perfil atualizado com sucesso');

    toast.promise(
      update({
        name: response.data?.name,
        image: response.data?.image,
        address: response.data?.address,
        phone: response.data?.phone,
        bio: response.data?.bio,
        role: response.data?.role,
        times: response.data?.times,
      }),
      {
        loading: 'Atualizando perfil...',
        success: 'Perfil atualizado com sucesso',
        error: 'Não foi possível atualizar o perfil',
      },
    );
  }

  return (
    <form onSubmit={profileSchema.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <CardContent className="flex flex-row items-center gap-4 p-0">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              aria-label="Alterar foto de perfil"
              className="group relative block size-24 overflow-hidden rounded-full border-2 border-border bg-muted transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Foto de perfil"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-3xl font-medium text-muted-foreground">
                  {displayName?.charAt(0)}
                </span>
              )}
              {isUploadingAvatar && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-3.5 text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium leading-none">{displayName}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Artista</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-4 text-lg font-medium">Informações gerais</h2>

          <FieldGroup>
            <Controller
              name="name"
              control={profileSchema.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={profileSchema.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Endereço do estúdio</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={profileSchema.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Celular</FieldLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      const formattedPhone = formatPhone(e.target.value);

                      field.onChange(formattedPhone);
                    }}
                  />
                  <FieldDescription>Digite seu número de celular.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="bio"
              control={profileSchema.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                  <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={profileSchema.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Função</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-2">
            <Label className="font-semibold">Configurar horarios:</Label>
            <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
              <DialogTrigger
                render={<Button variant={'outline'} className="w-full justify-between" />}
              >
                Clique aqui para selecionar horario
                <ArrowRight className="w-5 h-5" />
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecionar Horario</DialogTitle>
                  <DialogDescription>Escolha os horarios desejados.</DialogDescription>
                </DialogHeader>

                <section className="py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique nos horarios abaixo para marcar ou desmarcar.
                  </p>

                  <div className="grid grid-cols-5 gap-2">
                    {hours.map((hour) => (
                      <Button
                        key={hour}
                        variant={'outline'}
                        className={cn(
                          'border-2 rounded h-10',
                          selectedHour.includes(hour) && 'border-orange-600 text-primary',
                        )}
                        onClick={() => toggleHour(hour)}
                      >
                        {hour}
                      </Button>
                    ))}
                  </div>
                </section>

                <Button
                  className="w-full bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
                  onClick={() => setDialogIsOpen(false)}
                >
                  Fechar
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-fit bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer px-8"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Salvar alterações
      </Button>
    </form>
  );
}
