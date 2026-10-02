'use client';

import { Controller, useWatch } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ALLOWED_IMAGE_MIME_TYPES, type GalerySchemaData, useGalerySchema } from './schemas';
import { formatCurrency, parseCurrencyToCents } from '@/utils/formatService';
import type { Service } from '../../services/_data-access/get-all-services';
import { formatGaleryStyle, GALERY_STYLES } from '@/utils/formatGalery';
import { updateGaleryImage } from '../_actions/update-galery-image';
import type { Galery } from '../_data-access/get-all-galeries';
import { GaleryCardPreview } from './galery-card-preview';
import { createGalery } from '../_actions/create-galery';
import { updateGalery } from '../_actions/update-galery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GaleryFormProps {
  galery?: Galery | null;
  services: Service[];
}

const STYLE_ITEMS = GALERY_STYLES.map((style) => ({
  value: style,
  label: formatGaleryStyle(style),
}));

export function GaleryForm({ galery, services }: GaleryFormProps) {
  const router = useRouter();
  const form = useGalerySchema(galery);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!galery;

  const [image, title, style, size, price, serviceId] = useWatch({
    control: form.control,
    name: ['image', 'title', 'style', 'size', 'price', 'serviceId'],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;

    const url = URL.createObjectURL(image);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const serviceItems = services.map((service) => ({ value: service.id, label: service.name }));
  const selectedService = services.find((service) => service.id === serviceId);

  const { mutateAsync: createGaleryMutation, isPending: isCreating } = useMutation({
    mutationFn: createGalery,
  });

  const { mutateAsync: updateGaleryMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateGalery,
  });

  const { mutateAsync: updateImageMutation, isPending: isUploadingImage } = useMutation({
    mutationFn: updateGaleryImage,
  });

  const isPending = isCreating || isUpdating || isUploadingImage;

  async function handleCreate({ image, price, ...input }: GalerySchemaData) {
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('price', String(price));
    for (const [key, value] of Object.entries(input)) formData.append(key, value);

    const response = await createGaleryMutation(formData);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Flash publicado na galeria');
    router.push('/dashboard/galery');
  }

  async function handleUpdate(id: string, { image, ...input }: GalerySchemaData) {
    const response = await updateGaleryMutation({ id, ...input });

    if (response.error) {
      toast.error(response.error);
      return;
    }

    if (image) {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('file', image);

      const imageResponse = await updateImageMutation(formData);

      if (imageResponse.error) {
        toast.error(imageResponse.error);
        return;
      }
    }

    toast.success('Flash atualizado com sucesso');
    router.push('/dashboard/galery');
  }

  function onSubmit(data: GalerySchemaData) {
    return galery ? handleUpdate(galery.id, data) : handleCreate(data);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="overflow-hidden rounded-xl border bg-card"
      >
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">Detalhes do flash</h2>
          <p className="text-sm text-muted-foreground">Informações exibidas no card da galeria</p>
        </div>

        <div className="space-y-8 px-6 py-6">
          <section className="space-y-4">
            <SectionTitle index="01" title="A arte" />

            <Controller
              name="image"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Imagem da arte {!isEditing && '*'}</FieldLabel>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-invalid={fieldState.invalid}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition-colors hover:border-orange-600/60 aria-invalid:border-destructive"
                  >
                    <ImagePlus className="size-5 text-muted-foreground" />
                    <span className="font-medium">
                      {field.value?.name ??
                        (isEditing
                          ? 'Clique para trocar a imagem'
                          : 'Clique para enviar uma imagem')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG ou WEBP · até 5 MB
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    id={field.name}
                    type="file"
                    accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) field.onChange(file);
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </section>

          <section className="space-y-4 border-t pt-8">
            <SectionTitle index="02" title="Identidade" />

            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome do flash *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Ex.: Rosa Tradicional"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="style"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Estilo *</FieldLabel>
                      <Select
                        items={STYLE_ITEMS}
                        value={field.value}
                        onValueChange={(value) => value && field.onChange(value)}
                      >
                        <SelectTrigger
                          id={field.name}
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLE_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="size"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Tamanho *</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Ex.: 10x15cm"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="serviceId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Serviço vinculado *</FieldLabel>
                    <Select
                      items={serviceItems}
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? '')}
                      disabled={!services.length}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {services.length ? (
                        'Define a duração e o sinal cobrado no agendamento.'
                      ) : (
                        <>
                          Nenhum serviço ativo.{' '}
                          <Link href="/dashboard/services" className="text-orange-600 underline">
                            Cadastre um serviço
                          </Link>{' '}
                          antes de publicar.
                        </>
                      )}
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </section>

          <section className="space-y-4 border-t pt-8">
            <SectionTitle index="03" title="Valores" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Preço total *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode="numeric"
                      value={formatCurrency(field.value)}
                      onChange={(e) => field.onChange(parseCurrencyToCents(e.target.value))}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="deposit">Sinal para reservar</FieldLabel>
                <Input
                  id="deposit"
                  value={selectedService ? formatCurrency(selectedService.depositAmount) : '—'}
                  readOnly
                  disabled
                />
                <FieldDescription>Definido pelo serviço vinculado.</FieldDescription>
              </Field>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">* Campos obrigatórios</span>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="cursor-pointer"
              render={<Link href="/dashboard/galery" />}
              nativeButton={false}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="font-semibold bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Salvar alterações' : 'Publicar na galeria'}
            </Button>
          </div>
        </div>
      </form>

      <aside className="lg:sticky lg:top-4">
        <GaleryCardPreview
          imageUrl={imagePreview ?? galery?.imageUrl ?? null}
          title={title}
          style={style}
          size={size}
          price={price}
          available={galery?.available ?? true}
        />
      </aside>
    </div>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-orange-600">
      {index} / {title}
    </h3>
  );
}
