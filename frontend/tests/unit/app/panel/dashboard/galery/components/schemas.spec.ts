import { describe, expect, it } from 'bun:test';

import {
  createGalerySchema,
  MAX_IMAGE_SIZE_BYTES,
} from '@/app/(panel)/dashboard/galery/_components/schemas';

function buildImage({ type = 'image/png', size = 1024 } = {}) {
  return new File([new Uint8Array(size)], 'rosa.png', { type });
}

describe('createGalerySchema', () => {
  const validInput = {
    title: 'Rosa Tradicional',
    style: 'TRADICIONAL',
    size: '10x15cm',
    serviceId: 'service-1',
    price: 28000,
  };

  describe('when creating', () => {
    const schema = createGalerySchema(false);

    it('accepts a valid payload with an image', () => {
      const result = schema.safeParse({ ...validInput, image: buildImage() });

      expect(result.success).toBe(true);
    });

    it('requires the image', () => {
      const result = schema.safeParse(validInput);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['image']);
    });

    it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s images', (type) => {
      const result = schema.safeParse({ ...validInput, image: buildImage({ type }) });

      expect(result.success).toBe(true);
    });

    it('rejects unsupported image types', () => {
      const result = schema.safeParse({ ...validInput, image: buildImage({ type: 'image/gif' }) });

      expect(result.success).toBe(false);
    });

    it('rejects images above 5 MB', () => {
      const result = schema.safeParse({
        ...validInput,
        image: buildImage({ size: MAX_IMAGE_SIZE_BYTES + 1 }),
      });

      expect(result.success).toBe(false);
    });
  });

  describe('when editing', () => {
    const schema = createGalerySchema(true);

    it('accepts a payload without a new image', () => {
      const result = schema.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it('still validates a new image when provided', () => {
      const result = schema.safeParse({ ...validInput, image: buildImage({ type: 'image/gif' }) });

      expect(result.success).toBe(false);
    });
  });

  describe('fields', () => {
    const schema = createGalerySchema(true);

    it('rejects an empty title', () => {
      const result = schema.safeParse({ ...validInput, title: '   ' });

      expect(result.success).toBe(false);
    });

    it('rejects an unknown style', () => {
      const result = schema.safeParse({ ...validInput, style: 'AQUARELA' });

      expect(result.success).toBe(false);
    });

    it('rejects an empty size', () => {
      const result = schema.safeParse({ ...validInput, size: '' });

      expect(result.success).toBe(false);
    });

    it('rejects a missing service', () => {
      const result = schema.safeParse({ ...validInput, serviceId: '' });

      expect(result.success).toBe(false);
    });

    it('rejects a zero price', () => {
      const result = schema.safeParse({ ...validInput, price: 0 });

      expect(result.success).toBe(false);
    });

    it('rejects a non integer price', () => {
      const result = schema.safeParse({ ...validInput, price: 100.5 });

      expect(result.success).toBe(false);
    });
  });

  describe('price against the service deposit', () => {
    const schema = createGalerySchema(true, { 'service-1': 10000 });

    it('rejects a price below the deposit of the selected service', () => {
      const result = schema.safeParse({ ...validInput, price: 50 });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['price']);
      expect(result.error?.issues[0]?.message).toMatch(/não pode ser menor que o sinal/);
    });

    it('accepts a price equal to the deposit', () => {
      expect(schema.safeParse({ ...validInput, price: 10000 }).success).toBe(true);
    });

    it('ignores services it does not know about', () => {
      expect(schema.safeParse({ ...validInput, serviceId: 'service-2', price: 50 }).success).toBe(
        true,
      );
    });
  });
});
