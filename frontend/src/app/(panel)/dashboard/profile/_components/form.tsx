'use client';

import { useMutation } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { ArrowRight, Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from 'cn';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { UserStatus } from '@/app/(panel)/dashboard/_actions/update-status';
import { type ProfileSchemaData, useProfileSchema } from './profile-schema';
import { updateProfile } from '../_actions/update-profile';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatPhone } from '@/utils/formatPhone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProfileFormProps {
  user: {
    name: string;
    image: string | null;
    address: string | null;
    phone: string | null;
    bio: string | null;
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
    times: session?.user?.times ?? user.times,
    status: (session?.user?.status as UserStatus) ?? user.status,
  };

  const profileSchema = useProfileSchema({
    name: currentUser.name,
    address: currentUser.address,
    phone: currentUser.phone,
    bio: currentUser.bio,
    status: currentUser.status,
  });

  const [selectedHour, setSelectedHour] = useState<string[]>(currentUser.times || []);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = currentUser.name;
  const displayImage = avatarPreview ?? currentUser.image;

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
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
      times: selectedHour || [],
    });

    if (response.error) {
      toast.error(response.error);
      return;
    }

    await update({
      name: response.data?.name,
      image: response.data?.image,
      address: response.data?.address,
      phone: response.data?.phone,
      bio: response.data?.bio,
      times: response.data?.times,
    });

    toast.success('Perfil atualizado com sucesso');
  }

  return (
    <form onSubmit={profileSchema.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <CardContent className="flex flex-row items-center gap-4 p-0">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label="Alterar foto de perfil"
              className="group relative block size-24 overflow-hidden rounded-full border-2 border-border bg-muted transition-opacity hover:opacity-90 cursor-pointer"
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
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium leading-none">{displayName}</p>
            {currentUser.address && (
              <p className="mt-1.5 text-sm text-muted-foreground">Artista</p>
            )}
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
        Salvar alterações
      </Button>
    </form>
  );
}
