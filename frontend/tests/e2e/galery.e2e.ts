import { FLASH_IMAGE, FLASH_IMAGE_ALT } from './support/env';
import { expect, test } from './support/fixtures';
import { uniqueName } from './support/api';

test.describe('Galeria', () => {
  let serviceId: string;
  let serviceName: string;

  test.beforeEach(async ({ api }) => {
    await api.deleteAllData();

    serviceName = uniqueName('Flash pequeno');
    ({ id: serviceId } = await api.createService({
      name: serviceName,
      duration: 90,
      depositAmount: 8000,
    }));
  });

  test('publica um flash com imagem e ele aparece na listagem', async ({ page, api }) => {
    const title = uniqueName('Cobra Japonesa');

    await page.goto('/dashboard/galery');
    await expect(page.getByText('Nenhum flash cadastrado.')).toBeVisible();
    await page.getByRole('button', { name: 'Novo flash' }).click();
    await expect(page).toHaveURL(/\/dashboard\/galery\/new$/);

    await page.getByLabel(/Imagem da arte/).setInputFiles(FLASH_IMAGE);
    await page.getByLabel('Nome do flash *').fill(title);
    await page.getByLabel('Estilo *').click();
    await page.getByRole('option', { name: 'Japonês' }).click();
    await page.getByLabel('Tamanho *').fill('10x15cm');
    await page.getByLabel('Serviço vinculado *').click();
    await page.getByRole('option', { name: serviceName }).click();
    await page.getByLabel('Preço total *').fill('42000');

    await expect(page.getByLabel('Sinal para reservar')).toHaveValue(/R\$\s80,00/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    await page.getByRole('button', { name: 'Publicar na galeria' }).click();

    await expect(page.getByText('Flash publicado na galeria')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/galery$/);

    const card = page.getByRole('article').filter({ hasText: title });
    await expect(card).toContainText('Japonês');
    await expect(card).toContainText('10x15cm');
    await expect(card).toContainText(/R\$\s420,00/);
    await expect(card.getByRole('img', { name: title })).toBeVisible();

    const [created] = await api.listGaleries();
    expect(created?.imageUrl).toMatch(/^https:\/\//);
  });

  test('não publica sem imagem e campos obrigatórios', async ({ page, api }) => {
    await page.goto('/dashboard/galery/new');
    await page.getByRole('button', { name: 'Publicar na galeria' }).click();

    await expect(page.getByText('Envie a imagem da arte')).toBeVisible();
    await expect(page.getByText('Nome é obrigatório')).toBeVisible();
    await expect(page.getByText('Selecione o serviço vinculado')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/galery\/new$/);
    expect(await api.listGaleries()).toHaveLength(0);
  });

  test('filtra a listagem por estilo', async ({ page, api }) => {
    const japones = uniqueName('Carpa');
    const blackwork = uniqueName('Caveira');
    await api.createGalery({
      title: japones,
      style: 'JAPONES',
      size: '8cm',
      price: 30000,
      serviceId,
    });
    await api.createGalery({
      title: blackwork,
      style: 'BLACKWORK',
      size: '6cm',
      price: 25000,
      serviceId,
    });

    await page.goto('/dashboard/galery');
    await expect(page.getByRole('article')).toHaveCount(2);

    const filters = page.getByRole('group', { name: 'Filtrar por estilo' });
    await filters.getByRole('button', { name: 'Japonês' }).click();

    await expect(page).toHaveURL(/style=JAPONES/);
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('article').filter({ hasText: japones })).toBeVisible();

    await filters.getByRole('button', { name: 'Minimalista' }).click();
    await expect(page.getByText('Nenhum flash Minimalista cadastrado.')).toBeVisible();

    await filters.getByRole('button', { name: 'Todos' }).click();
    await expect(page).not.toHaveURL(/style=/);
    await expect(page.getByRole('article')).toHaveCount(2);
  });

  test('filtra pelo select no mobile', async ({ page, api }) => {
    const realismo = uniqueName('Retrato');
    await api.createGalery({
      title: realismo,
      style: 'REALISMO',
      size: '15cm',
      price: 90000,
      serviceId,
    });
    await api.createGalery({
      title: uniqueName('Rosa'),
      style: 'TRADICIONAL',
      size: '6cm',
      price: 20000,
      serviceId,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/galery');

    await expect(page.getByRole('group', { name: 'Filtrar por estilo' })).toBeHidden();
    await page.getByRole('combobox', { name: 'Filtrar por estilo' }).click();
    await page.getByRole('option', { name: 'Realismo' }).click();

    await expect(page).toHaveURL(/style=REALISMO/);
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('article').filter({ hasText: realismo })).toBeVisible();
  });

  test('edita os dados e troca a imagem de um flash', async ({ page, api }) => {
    const title = uniqueName('Rosa');
    const newTitle = uniqueName('Rosa Vermelha');
    const galery = await api.createGalery({
      title,
      style: 'TRADICIONAL',
      size: '6cm',
      price: 28000,
      serviceId,
    });

    await page.goto('/dashboard/galery');
    await page.getByRole('button', { name: `Editar ${title}` }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/galery/edit/${galery.id}$`));

    await expect(page.getByLabel('Nome do flash *')).toHaveValue(title);
    await expect(page.getByLabel('Serviço vinculado *')).toContainText(serviceName);

    await page.getByLabel('Nome do flash *').fill(newTitle);
    await page.getByLabel('Tamanho *').fill('9cm');
    await page.getByLabel(/Imagem da arte/).setInputFiles(FLASH_IMAGE_ALT);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();

    await expect(page.getByText('Flash atualizado com sucesso')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/galery$/);

    const card = page.getByRole('article').filter({ hasText: newTitle });
    await expect(card).toContainText('9cm');

    const updated = await api.getGalery(galery.id);
    expect(updated.title).toBe(newTitle);
    expect(updated.imageUrl).not.toBe(galery.imageUrl);
  });

  test('marca um flash como indisponível e mantém após recarregar', async ({ page, api }) => {
    const title = uniqueName('Borboleta');
    const galery = await api.createGalery({
      title,
      style: 'FINELINE',
      size: '5cm',
      price: 22000,
      serviceId,
    });

    await page.goto('/dashboard/galery');
    const card = page.getByRole('article').filter({ hasText: title });

    await card.getByRole('switch', { name: 'Marcar como indisponível' }).click();
    await expect(page.getByText('Flash indisponível')).toBeVisible();

    await page.reload();
    await expect(card.getByRole('switch')).not.toBeChecked();
    await expect(card.getByRole('img', { name: title })).toHaveClass(/grayscale/);
    expect((await api.getGalery(galery.id)).available).toBe(false);
  });

  test('abre 404 ao editar um flash inexistente', async ({ page }) => {
    await page.goto('/dashboard/galery/edit/00000000-0000-4000-8000-000000000000');

    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
    await expect(page.getByLabel('Nome do flash *')).toHaveCount(0);
  });
});
