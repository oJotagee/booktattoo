import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { type APIRequest, type APIRequestContext, request } from '@playwright/test';
import { Client } from 'pg';

import { E2E_ENV, FLASH_IMAGE } from './env';

type Session = { accessToken: string; user: { id: string } };

export type ServiceInput = {
  name: string;
  duration: number;
  depositAmount: number;
};

export type GaleryInput = {
  title: string;
  style: string;
  size: string;
  price: number;
  serviceId: string;
  image?: string;
};

export type ApiGalery = { id: string; title: string; imageUrl: string; available: boolean };
export type ApiService = { id: string; name: string };

export class E2EApi {
  private constructor(
    private readonly context: APIRequestContext,
    readonly userId: string,
  ) {}

  static async connect(requestFactory: APIRequest = request): Promise<E2EApi> {
    const anonymous = await requestFactory.newContext({ baseURL: E2E_ENV.apiUrl });
    const { user } = E2E_ENV;

    const register = await anonymous.post('/auth/register', { data: user });
    if (!register.ok() && register.status() !== 409) {
      throw new Error(
        `Falha ao registrar o usuário E2E (${register.status()}): ${await register.text()}`,
      );
    }

    const login = await anonymous.post('/auth/login', {
      data: { email: user.email, password: user.password },
    });
    if (!login.ok()) {
      throw new Error(`Falha no login do usuário E2E (${login.status()}): ${await login.text()}`);
    }

    const session = (await login.json()) as Session;
    await anonymous.dispose();

    const context = await requestFactory.newContext({
      baseURL: E2E_ENV.apiUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${session.accessToken}` },
    });

    return new E2EApi(context, session.user.id);
  }

  async createService(input: ServiceInput): Promise<ApiService> {
    const response = await this.context.post('/services', { data: input });
    await assertOk(response, 'criar serviço');
    return response.json();
  }

  async updateServiceStatus(id: string, status: boolean): Promise<void> {
    const response = await this.context.patch(`/services/${id}/status`, { data: { status } });
    await assertOk(response, 'atualizar status do serviço');
  }

  async createGalery({ image = FLASH_IMAGE, ...input }: GaleryInput): Promise<ApiGalery> {
    const response = await this.context.post('/galeries', {
      multipart: {
        ...input,
        price: String(input.price),
        file: {
          name: path.basename(image),
          mimeType: 'image/jpeg',
          buffer: await readFile(image),
        },
      },
    });
    await assertOk(response, 'criar flash');
    return response.json();
  }

  async getGalery(id: string): Promise<ApiGalery> {
    const response = await this.context.get(`/galeries/${id}`);
    await assertOk(response, 'buscar flash');
    return response.json();
  }

  async listGaleries(): Promise<ApiGalery[]> {
    const response = await this.context.get('/galeries', { params: { limit: 100, offset: 0 } });
    await assertOk(response, 'listar flashes');
    return (await response.json()).list;
  }

  async deleteAllData(): Promise<void> {
    let galeries = await this.listGaleries();

    while (galeries.length) {
      for (const galery of galeries) {
        const response = await this.context.delete(`/galeries/${galery.id}`);
        await assertOk(response, 'apagar flash');
      }
      galeries = await this.listGaleries();
    }

    const client = new Client({ connectionString: E2E_ENV.catalogDatabaseUrl });
    await client.connect();
    try {
      await client.query('DELETE FROM "Service" WHERE "userId" = $1', [this.userId]);
    } finally {
      await client.end();
    }
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}

async function assertOk(response: Awaited<ReturnType<APIRequestContext['get']>>, action: string) {
  if (!response.ok()) {
    throw new Error(`Falha ao ${action} (${response.status()}): ${await response.text()}`);
  }
}

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}
