import { InvalidArtistError } from '../errors/artist.error';

export enum ArtistStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VACATION = 'VACATION',
}

type ArtistProps = {
  id: string;
  name: string;
  image: string | null;
  status: ArtistStatus;
  lastEventAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ArtistChange = {
  name: string;
  image: string | null;
  status: ArtistStatus;
  occurredAt: Date;
};

type ArtistCreateInput = ArtistChange & {
  id: string;
};

export class ArtistEntity {
  private constructor(private readonly props: ArtistProps) {
    ArtistEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get image(): string | null {
    return this.props.image;
  }

  get status(): ArtistStatus {
    return this.props.status;
  }

  get lastEventAt(): Date {
    return this.props.lastEventAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isInactive(): boolean {
    return this.status === ArtistStatus.INACTIVE;
  }

  static create({ occurredAt, ...input }: ArtistCreateInput): ArtistEntity {
    const now = new Date();

    return new ArtistEntity({
      ...input,
      lastEventAt: occurredAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ArtistProps): ArtistEntity {
    return new ArtistEntity({ ...props });
  }

  isOutdatedBy(occurredAt: Date): boolean {
    return occurredAt.getTime() > this.lastEventAt.getTime();
  }

  applyChange({ occurredAt, ...change }: ArtistChange): ArtistEntity {
    return new ArtistEntity({
      ...this.props,
      ...change,
      lastEventAt: occurredAt,
      updatedAt: new Date(),
    });
  }

  private static validate(props: ArtistProps) {
    if (!props.id.trim()) throw new InvalidArtistError('id é obrigatório.');
    if (!props.name.trim()) throw new InvalidArtistError('name é obrigatório.');
    if (!Object.values(ArtistStatus).includes(props.status))
      throw new InvalidArtistError(`status inválido: ${props.status}.`);
  }
}
