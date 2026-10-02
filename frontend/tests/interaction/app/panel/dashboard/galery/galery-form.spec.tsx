import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, router, toast } from '../../../../support/next';
import { buildGalery, buildService } from '../../../../support/builders';
import { renderWithProviders } from '../../../../support/render';
import { formatCurrency } from '@/utils/formatService';

type ActionResult = { data?: unknown; error?: string };

const createGalery = mock(async (_formData: FormData): Promise<ActionResult> => ({ data: {} }));
const updateGalery = mock(
  async (_input: Record<string, unknown>): Promise<ActionResult> => ({ data: {} }),
);
const updateGaleryImage = mock(
  async (_formData: FormData): Promise<ActionResult> => ({ data: {} }),
);

mock.module('@/app/(panel)/dashboard/galery/_actions/create-galery', () => ({ createGalery }));
mock.module('@/app/(panel)/dashboard/galery/_actions/update-galery', () => ({ updateGalery }));
mock.module('@/app/(panel)/dashboard/galery/_actions/update-galery-image', () => ({
  updateGaleryImage,
}));

const { GaleryForm } = await import('@/app/(panel)/dashboard/galery/_components/galery-form');

const services = [
  buildService({ id: 'service-1', name: 'Flash pequeno', depositAmount: 5000 }),
  buildService({ id: 'service-2', name: 'Flash grande', depositAmount: 12000 }),
];

function buildImage(type = 'image/png') {
  return new File(['image'], 'rosa.png', { type });
}

describe('GaleryForm', () => {
  beforeEach(() => {
    resetNextMocks();
    for (const action of [createGalery, updateGalery, updateGaleryImage]) {
      action.mockClear();
      action.mockImplementation(async () => ({ data: {} }));
    }
  });

  describe('creating', () => {
    it('shows the validation errors and does not submit an empty form', async () => {
      const { user } = renderWithProviders(<GaleryForm services={services} />);

      await user.click(screen.getByRole('button', { name: 'Publicar na galeria' }));

      expect(await screen.findByText('Envie a imagem da arte')).toBeInTheDocument();
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Tamanho é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Selecione o serviço vinculado')).toBeInTheDocument();
      expect(screen.getByText('Informe o preço do flash')).toBeInTheDocument();
      expect(createGalery).not.toHaveBeenCalled();
    });

    it('updates the card preview while typing', async () => {
      const { user } = renderWithProviders(<GaleryForm services={services} />);

      expect(screen.getByRole('heading', { name: 'Nome do flash' })).toBeInTheDocument();
      expect(screen.getByText('Sua arte aparece aqui')).toBeInTheDocument();

      await user.type(screen.getByLabelText('Nome do flash *'), 'Rosa');
      await user.type(screen.getByLabelText('Tamanho *'), '8cm');
      await user.type(screen.getByLabelText('Preço total *'), '28000');
      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage());

      expect(screen.getByRole('heading', { name: 'Rosa' })).toBeInTheDocument();
      expect(screen.getByText('8cm')).toBeInTheDocument();
      expect(screen.getByText('R$ 280,00')).toBeInTheDocument();
      expect(await screen.findByRole('img', { name: 'Rosa' })).toBeInTheDocument();
      expect(screen.getByText('rosa.png')).toBeInTheDocument();
    });

    it('shows the deposit of the selected service', async () => {
      const { user } = renderWithProviders(<GaleryForm services={services} />);

      expect(screen.getByLabelText('Sinal para reservar')).toHaveValue('—');

      await user.click(screen.getByLabelText('Serviço vinculado *'));
      await user.click(await screen.findByRole('option', { name: 'Flash grande' }));

      expect(screen.getByLabelText('Sinal para reservar')).toHaveValue(formatCurrency(12000));
    });

    it('rejects unsupported image types', async () => {
      const user = (await import('@testing-library/user-event')).default.setup({
        applyAccept: false,
      });
      renderWithProviders(<GaleryForm services={services} />);

      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage('image/gif'));
      await user.click(screen.getByRole('button', { name: 'Publicar na galeria' }));

      expect(await screen.findByText('Use JPG, PNG ou WEBP')).toBeInTheDocument();
      expect(createGalery).not.toHaveBeenCalled();
    });

    it('publishes the flash as multipart and goes back to the gallery', async () => {
      const { user } = renderWithProviders(<GaleryForm services={services} />);

      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage());
      await user.type(screen.getByLabelText('Nome do flash *'), 'Cobra Japonesa');
      await user.click(screen.getByLabelText('Estilo *'));
      await user.click(await screen.findByRole('option', { name: 'Japonês' }));
      await user.type(screen.getByLabelText('Tamanho *'), '10x15cm');
      await user.click(screen.getByLabelText('Serviço vinculado *'));
      await user.click(await screen.findByRole('option', { name: 'Flash pequeno' }));
      await user.type(screen.getByLabelText('Preço total *'), '42000');

      await user.click(screen.getByRole('button', { name: 'Publicar na galeria' }));

      await waitFor(() => expect(createGalery).toHaveBeenCalledTimes(1));
      const formData = createGalery.mock.calls[0]?.[0] as FormData;
      expect(formData.get('title')).toBe('Cobra Japonesa');
      expect(formData.get('style')).toBe('JAPONES');
      expect(formData.get('size')).toBe('10x15cm');
      expect(formData.get('serviceId')).toBe('service-1');
      expect(formData.get('price')).toBe('42000');
      expect((formData.get('file') as File).name).toBe('rosa.png');

      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard/galery'));
      expect(toast.success).toHaveBeenCalledWith('Flash publicado na galeria');
    });

    it('keeps the user on the page when the API returns an error', async () => {
      createGalery.mockImplementation(async () => ({ error: 'Serviço não encontrado' }));
      const { user } = renderWithProviders(<GaleryForm services={services} />);

      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage());
      await user.type(screen.getByLabelText('Nome do flash *'), 'Rosa');
      await user.type(screen.getByLabelText('Tamanho *'), '8cm');
      await user.click(screen.getByLabelText('Serviço vinculado *'));
      await user.click(await screen.findByRole('option', { name: 'Flash pequeno' }));
      await user.type(screen.getByLabelText('Preço total *'), '100');

      await user.click(screen.getByRole('button', { name: 'Publicar na galeria' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Serviço não encontrado'));
      expect(router.push).not.toHaveBeenCalled();
    });

    it('asks to register a service when there are none', () => {
      renderWithProviders(<GaleryForm services={[]} />);

      expect(screen.getByRole('link', { name: 'Cadastre um serviço' })).toHaveAttribute(
        'href',
        '/dashboard/services',
      );
      expect(screen.getByLabelText('Serviço vinculado *')).toBeDisabled();
    });
  });

  describe('editing', () => {
    const galery = buildGalery({ serviceId: 'service-2' });

    it('fills the form with the current flash', () => {
      renderWithProviders(<GaleryForm galery={galery} services={services} />);

      expect(screen.getByLabelText('Nome do flash *')).toHaveValue('Rosa Tradicional');
      expect(screen.getByLabelText('Tamanho *')).toHaveValue('10x15cm');
      expect(screen.getByLabelText('Preço total *')).toHaveValue(formatCurrency(28000));
      expect(screen.getByLabelText('Estilo *')).toHaveTextContent('Tradicional');
      expect(screen.getByLabelText('Serviço vinculado *')).toHaveTextContent('Flash grande');
      expect(screen.getByLabelText('Sinal para reservar')).toHaveValue(formatCurrency(12000));
      expect(screen.getByRole('img', { name: 'Rosa Tradicional' })).toHaveAttribute(
        'src',
        galery.imageUrl,
      );
      expect(screen.getByText('Clique para trocar a imagem')).toBeInTheDocument();
    });

    it('saves the changes without uploading an image', async () => {
      const { user } = renderWithProviders(<GaleryForm galery={galery} services={services} />);

      const title = screen.getByLabelText('Nome do flash *');
      await user.clear(title);
      await user.type(title, 'Rosa Vermelha');
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      await waitFor(() =>
        expect(updateGalery).toHaveBeenCalledWith(
          {
            id: 'galery-1',
            title: 'Rosa Vermelha',
            style: 'TRADICIONAL',
            size: '10x15cm',
            serviceId: 'service-2',
            price: 28000,
          },
          expect.anything(),
        ),
      );
      expect(updateGaleryImage).not.toHaveBeenCalled();
      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard/galery'));
      expect(toast.success).toHaveBeenCalledWith('Flash atualizado com sucesso');
    });

    it('uploads the new image after saving the info', async () => {
      const { user } = renderWithProviders(<GaleryForm galery={galery} services={services} />);

      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage());
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      await waitFor(() => expect(updateGaleryImage).toHaveBeenCalledTimes(1));
      expect(updateGalery).toHaveBeenCalledTimes(1);
      const formData = updateGaleryImage.mock.calls[0]?.[0] as FormData;
      expect(formData.get('id')).toBe('galery-1');
      expect((formData.get('file') as File).name).toBe('rosa.png');
      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard/galery'));
    });

    it('does not upload the image when saving the info fails', async () => {
      updateGalery.mockImplementation(async () => ({ error: 'Não autorizado' }));
      const { user } = renderWithProviders(<GaleryForm galery={galery} services={services} />);

      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage());
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Não autorizado'));
      expect(updateGaleryImage).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
    });

    it('stays on the page when the image upload fails', async () => {
      updateGaleryImage.mockImplementation(async () => ({ error: 'Imagem inválida' }));
      const { user } = renderWithProviders(<GaleryForm galery={galery} services={services} />);

      await user.upload(screen.getByLabelText(/Imagem da arte/), buildImage());
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Imagem inválida'));
      expect(router.push).not.toHaveBeenCalled();
    });
  });
});
