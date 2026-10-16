export const CATALOG_GATEWAY = Symbol('CATALOG_GATEWAY');

export type GalerySnapshot = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  available: boolean;
  userId: string;
  serviceId: string;
  service: {
    duration: number;
    depositAmount: number;
  };
};

export interface CatalogGateway {
  findGaleryById(id: string): Promise<GalerySnapshot | null>;
}
