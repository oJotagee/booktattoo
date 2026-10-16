export const ARTIST_GATEWAY = Symbol('ARTIST_GATEWAY');

export type ArtistSnapshot = {
  id: string;
  name: string;
  status: string;
  times: string[];
};

export interface ArtistGateway {
  findById(id: string): Promise<ArtistSnapshot | null>;
}
