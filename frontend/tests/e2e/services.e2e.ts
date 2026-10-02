import { expect, test } from './support/fixtures';
import { uniqueName } from './support/api';

test.describe('Serviços', () => {
  test.beforeEach(async ({ api }) => {
    await api.deleteAllData();
  });

  test('cadastra um serviço pelo dialog', async ({ page }) => {
    const name = uniqueName('Fechamento de braço');

    await page.goto('/dashboard/services');
    await expect(page.getByText('Nenhum serviço cadastrado.')).toBeVisible();

    await page.getByRole('button', { name: 'Novo serviço' }).click();

    const dialog = page.getByRole('dialog', { name: 'Novo Serviço' });
    await dialog.getByLabel('Nome').fill(name);
    await dialog.getByLabel('Depósito mínimo').fill('15000');
    await dialog.getByLabel('Horas').fill('3');
    await dialog.getByLabel('Minutos').fill('30');
    await dialog.getByRole('button', { name: 'Cadastrar Serviço' }).click();

    await expect(page.getByText('Serviço criado com sucesso')).toBeVisible();
    await expect(dialog).toBeHidden();

    const row = page.getByRole('row').filter({ hasText: name });
    await expect(row).toContainText('3h30');
    await expect(row).toContainText('R$ 150,00');
    await expect(row).toContainText('Ativo');
  });

  test('valida os campos obrigatórios', async ({ page }) => {
    await page.goto('/dashboard/services');
    await page.getByRole('button', { name: 'Novo serviço' }).click();

    const dialog = page.getByRole('dialog', { name: 'Novo Serviço' });
    await dialog.getByLabel('Horas').fill('0');
    await dialog.getByLabel('Minutos').fill('0');
    await dialog.getByRole('button', { name: 'Cadastrar Serviço' }).click();

    await expect(dialog.getByText('Nome é obrigatório')).toBeVisible();
    await expect(dialog.getByText('Informe o valor do depósito mínimo')).toBeVisible();
    await expect(dialog.getByText('A duração deve ser maior que zero')).toBeVisible();
  });

  test('edita um serviço existente', async ({ page, api }) => {
    const name = uniqueName('Flash médio');
    const newName = uniqueName('Flash grande');
    await api.createService({ name, duration: 60, depositAmount: 10000 });

    await page.goto('/dashboard/services');
    await page.getByRole('button', { name: `Editar ${name}` }).click();

    const dialog = page.getByRole('dialog', { name: 'Editar Serviço' });
    await expect(dialog.getByLabel('Nome')).toHaveValue(name);
    await dialog.getByLabel('Nome').fill(newName);
    await dialog.getByLabel('Horas').fill('2');
    await dialog.getByRole('button', { name: 'Atualizar Serviço' }).click();

    await expect(page.getByText('Serviço atualizado com sucesso')).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: newName });
    await expect(row).toContainText('2h');
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
  });

  test('desativa e reativa um serviço', async ({ page, api }) => {
    const name = uniqueName('Cover-up');
    await api.createService({ name, duration: 120, depositAmount: 20000 });

    await page.goto('/dashboard/services');
    const row = page.getByRole('row').filter({ hasText: name });

    await row.getByRole('switch', { name: 'Desativar serviço' }).click();
    await expect(page.getByText('Serviço desativado')).toBeVisible();
    await expect(row).toContainText('Inativo');

    await page.reload();
    await expect(row.getByRole('switch')).not.toBeChecked();

    await row.getByRole('switch', { name: 'Ativar serviço' }).click();
    await expect(page.getByText('Serviço ativado')).toBeVisible();
    await expect(row.getByRole('switch')).toBeChecked();
  });

  test('pagina a listagem de 5 em 5', async ({ page, api }) => {
    for (let index = 1; index <= 6; index++) {
      await api.createService({
        name: uniqueName(`Serviço ${index}`),
        duration: 60,
        depositAmount: 5000,
      });
    }

    await page.goto('/dashboard/services');
    await expect(page.getByText('1–5 de 6')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await page.getByRole('button', { name: 'Próxima página' }).click();

    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText('6–6 de 6')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });
});
