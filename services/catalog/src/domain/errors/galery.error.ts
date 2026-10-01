export class InvalidGaleryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGaleryError';
  }
}

export class GaleryNotFoundError extends Error {
  constructor(id: string) {
    super(`Galeria com ID ${id} não encontrada.`);
    this.name = 'GaleryNotFoundError';
  }
}

export class GaleryAlreadyInStatusError extends Error {
  constructor(status: boolean) {
    super(`Galeria já está com status ${status ? 'ativo' : 'inativo'}.`);
    this.name = 'GaleryAlreadyInStatusError';
  }
}

export class UnsupportedGaleryImageTypeError extends Error {
  constructor(mimetype: string) {
    super(`Tipo de arquivo não suportado para imagem da galeria: ${mimetype}.`);
    this.name = 'UnsupportedGaleryImageTypeError';
  }
}
