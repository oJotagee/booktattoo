import { describe, expect, it } from 'bun:test';

import { GaleryAlreadyInStatusError, InvalidGaleryError } from '@/domain/errors/galery.error';
import { GaleryEntity, GaleryStyle } from '@/domain/entities/galery.entity';

const validInput = {
  id: 'galery-1',
  title: 'Rosa fineline',
  imageUrl: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/rosa.png',
  size: '10x15cm',
  price: 35000,
  style: GaleryStyle.FINELINE,
  userId: 'user-1',
  serviceId: 'service-1',
};

function buildGalery() {
  return GaleryEntity.create(validInput);
}

describe('GaleryEntity', () => {
  it('creates a galery available by default with timestamps', () => {
    const galery = buildGalery();

    expect(galery.id).toBe('galery-1');
    expect(galery.available).toBe(true);
    expect(galery.createdAt).toBeInstanceOf(Date);
    expect(galery.updatedAt).toBeInstanceOf(Date);
  });

  it('throws InvalidGaleryError when id is empty', () => {
    expect(() => GaleryEntity.create({ ...validInput, id: '  ' })).toThrow(InvalidGaleryError);
  });

  it('throws InvalidGaleryError when title is empty', () => {
    expect(() => GaleryEntity.create({ ...validInput, title: '   ' })).toThrow(InvalidGaleryError);
  });

  it('throws InvalidGaleryError when imageUrl is empty', () => {
    expect(() => GaleryEntity.create({ ...validInput, imageUrl: '' })).toThrow(InvalidGaleryError);
  });

  it('throws InvalidGaleryError when size is empty', () => {
    expect(() => GaleryEntity.create({ ...validInput, size: ' ' })).toThrow(InvalidGaleryError);
  });

  it('throws InvalidGaleryError when price is not positive', () => {
    expect(() => GaleryEntity.create({ ...validInput, price: 0 })).toThrow(InvalidGaleryError);
  });

  it('throws InvalidGaleryError when serviceId is empty', () => {
    expect(() => GaleryEntity.create({ ...validInput, serviceId: '' })).toThrow(InvalidGaleryError);
  });

  it('updates info keeping unspecified fields unchanged', () => {
    const galery = buildGalery();

    const updated = galery.update({ price: 50000 });

    expect(updated.price).toBe(50000);
    expect(updated.title).toBe(galery.title);
    expect(updated.size).toBe(galery.size);
    expect(updated.style).toBe(galery.style);
    expect(updated.serviceId).toBe(galery.serviceId);
    expect(updated.imageUrl).toBe(galery.imageUrl);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(galery.updatedAt.getTime());
  });

  it('ignores explicitly undefined fields on update', () => {
    const galery = buildGalery();

    const updated = galery.update({ title: undefined, size: undefined });

    expect(updated.title).toBe(galery.title);
    expect(updated.size).toBe(galery.size);
  });

  it('updates the image url', () => {
    const galery = buildGalery();

    const updated = galery.updateImage('https://bookink-assets.s3.amazonaws.com/gallery/new.png');

    expect(updated.imageUrl).toBe('https://bookink-assets.s3.amazonaws.com/gallery/new.png');
  });

  it('throws InvalidGaleryError when updating the image to an empty url', () => {
    const galery = buildGalery();

    expect(() => galery.updateImage('')).toThrow(InvalidGaleryError);
  });

  it('activates an unavailable galery', () => {
    const galery = buildGalery().deactivate();

    const activated = galery.activate();

    expect(activated.available).toBe(true);
  });

  it('throws GaleryAlreadyInStatusError when activating an already available galery', () => {
    const galery = buildGalery();

    expect(() => galery.activate()).toThrow(GaleryAlreadyInStatusError);
  });

  it('deactivates an available galery', () => {
    const galery = buildGalery();

    const deactivated = galery.deactivate();

    expect(deactivated.available).toBe(false);
  });

  it('throws GaleryAlreadyInStatusError when deactivating an already unavailable galery', () => {
    const galery = buildGalery().deactivate();

    expect(() => galery.deactivate()).toThrow(GaleryAlreadyInStatusError);
  });

  it('exposes a safe JSON representation', () => {
    const galery = buildGalery();

    const json = galery.toSafeJSON();

    expect(json.title).toBe('Rosa fineline');
    expect(json.userId).toBe('user-1');
    expect(json.serviceId).toBe('service-1');
  });
});
