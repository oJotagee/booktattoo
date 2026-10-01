import { GaleryAlreadyInStatusError, InvalidGaleryError } from '../errors/galery.error';

export enum GaleryStyle {
  TRADICIONAL = 'TRADICIONAL',
  JAPONES = 'JAPONES',
  BLACKWORK = 'BLACKWORK',
  FINELINE = 'FINELINE',
  NEOTRADICIONAL = 'NEOTRADICIONAL',
  CHICANO = 'CHICANO',
  REALISMO = 'REALISMO',
  MINIMALISTA = 'MINIMALISTA',
}

type GaleryProps = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  available: boolean;
  userId: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
};

type GaleryCreateInput = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  userId: string;
  serviceId: string;
};

type GaleryUpdateInput = {
  title?: string;
  size?: string;
  price?: number;
  style?: GaleryStyle;
  serviceId?: string;
};

type GaleryRestoreInput = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  available: boolean;
  userId: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class GaleryEntity {
  private constructor(private readonly galeryProps: GaleryProps) {
    GaleryEntity.validate(galeryProps);
  }

  get id(): string {
    return this.galeryProps.id;
  }

  get title(): string {
    return this.galeryProps.title;
  }

  get imageUrl(): string {
    return this.galeryProps.imageUrl;
  }

  get size(): string {
    return this.galeryProps.size;
  }

  get price(): number {
    return this.galeryProps.price;
  }

  get style(): GaleryStyle {
    return this.galeryProps.style;
  }

  get available(): boolean {
    return this.galeryProps.available;
  }

  get userId(): string {
    return this.galeryProps.userId;
  }

  get serviceId(): string {
    return this.galeryProps.serviceId;
  }

  get createdAt(): Date {
    return this.galeryProps.createdAt;
  }

  get updatedAt(): Date {
    return this.galeryProps.updatedAt;
  }

  static create(input: GaleryCreateInput): GaleryEntity {
    const now = new Date();

    const galery = new GaleryEntity({
      id: input.id,
      title: input.title,
      imageUrl: input.imageUrl,
      size: input.size,
      price: input.price,
      style: input.style,
      available: true,
      userId: input.userId,
      serviceId: input.serviceId,
      createdAt: now,
      updatedAt: now,
    });

    return galery;
  }

  static restore(input: GaleryRestoreInput): GaleryEntity {
    return new GaleryEntity({ ...input });
  }

  update(input: GaleryUpdateInput): GaleryEntity {
    return new GaleryEntity({
      ...this.galeryProps,
      title: input.title ?? this.title,
      size: input.size ?? this.size,
      price: input.price ?? this.price,
      style: input.style ?? this.style,
      serviceId: input.serviceId ?? this.serviceId,
      updatedAt: new Date(),
    });
  }

  updateImage(imageUrl: string): GaleryEntity {
    return new GaleryEntity({
      ...this.galeryProps,
      imageUrl,
      updatedAt: new Date(),
    });
  }

  activate(): GaleryEntity {
    if (this.available === true) throw new GaleryAlreadyInStatusError(this.available);

    return new GaleryEntity({
      ...this.galeryProps,
      available: true,
      updatedAt: new Date(),
    });
  }

  deactivate(): GaleryEntity {
    if (this.available === false) throw new GaleryAlreadyInStatusError(this.available);

    return new GaleryEntity({
      ...this.galeryProps,
      available: false,
      updatedAt: new Date(),
    });
  }

  toSafeJSON(): GaleryProps {
    return {
      id: this.id,
      title: this.title,
      imageUrl: this.imageUrl,
      size: this.size,
      price: this.price,
      style: this.style,
      available: this.available,
      userId: this.userId,
      serviceId: this.serviceId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static validate(props: GaleryProps) {
    if (!props.id.trim()) throw new InvalidGaleryError('Galery not found.');
    if (!props.title.trim()) throw new InvalidGaleryError('Galery title cannot be empty.');
    if (!props.imageUrl.trim()) throw new InvalidGaleryError('Image URL cannot be empty.');
    if (!props.size.trim()) throw new InvalidGaleryError('Size cannot be empty.');
    if (props.price <= 0) throw new InvalidGaleryError('Price must be greater than 0.');
    if (!props.serviceId.trim()) throw new InvalidGaleryError('Service ID cannot be empty.');
  }
}
