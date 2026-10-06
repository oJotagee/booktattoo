export class InvalidArtistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArtistError';
  }
}
