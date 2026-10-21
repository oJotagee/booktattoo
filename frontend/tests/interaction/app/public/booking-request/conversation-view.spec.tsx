import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';
import type { ClientConversation } from '@/app/(public)/_data-access/get-client-conversation';

const TOKEN = 'conversation-1.signature';

const conversation: ClientConversation = {
  id: 'request-1',
  status: 'OPEN',
  clientName: 'Mariana Costa',
  artistId: 'user-1',
  artistName: 'Ana Lima',
  closedAt: null,
  createdAt: '2026-10-20T14:00:00.000Z',
  messages: [
    {
      id: 'message-1',
      author: 'CLIENT',
      body: 'Quero uma rosa fineline.',
      createdAt: '2026-10-20T14:00:00.000Z',
    },
    {
      id: 'message-2',
      author: 'ARTIST',
      body: 'Consigo sim! Qual tamanho?',
      createdAt: '2026-10-20T15:00:00.000Z',
    },
  ],
  offer: null,
};

const getClientConversation = mock(
  async (_token: string): Promise<ClientConversation | null> => conversation,
);

type ActionResult = { data?: ClientConversation['messages'][number]; error?: string };

const sendClientMessage = mock(
  async (_input: { token: string; body: string }): Promise<ActionResult> => ({
    data: {
      id: 'message-3',
      author: 'CLIENT',
      body: 'Uns 10 cm.',
      createdAt: '2026-10-20T16:00:00.000Z',
    },
  }),
);

mock.module('@/app/(public)/_data-access/get-client-conversation', () => ({
  getClientConversation,
}));
mock.module('@/app/(public)/_actions/send-client-message', () => ({ sendClientMessage }));

const { ConversationView } = await import(
  '@/app/(public)/pedido/[token]/_components/conversation-view'
);

describe('ConversationView', () => {
  beforeEach(() => {
    resetNextMocks();
    sendClientMessage.mockClear();
    getClientConversation.mockClear();
    getClientConversation.mockImplementation(async () => conversation);
  });

  it('shows the messages and the save link notice', () => {
    renderWithProviders(<ConversationView token={TOKEN} initialConversation={conversation} />);

    expect(screen.getByText('Quero uma rosa fineline.')).toBeInTheDocument();
    expect(screen.getByText('Consigo sim! Qual tamanho?')).toBeInTheDocument();
    expect(screen.getByText(/Salve este link para voltar à conversa/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copiar link' })).toBeInTheDocument();
  });

  it('sends a message with the token', async () => {
    const { user } = renderWithProviders(
      <ConversationView token={TOKEN} initialConversation={conversation} />,
    );

    await user.type(screen.getByLabelText('Sua mensagem'), 'Uns 10 cm.');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() =>
      expect(sendClientMessage).toHaveBeenCalledWith(
        { token: TOKEN, body: 'Uns 10 cm.' },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(screen.getByLabelText('Sua mensagem')).toHaveValue(''));
  });

  it('keeps the text and shows the error when sending fails', async () => {
    sendClientMessage.mockImplementationOnce(async () => ({
      error: 'Aguarde a resposta do tatuador para mandar mais mensagens.',
    }));
    const { user } = renderWithProviders(
      <ConversationView token={TOKEN} initialConversation={conversation} />,
    );

    await user.type(screen.getByLabelText('Sua mensagem'), 'Oi de novo');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Aguarde a resposta do tatuador para mandar mais mensagens.',
      ),
    );
    expect(screen.getByLabelText('Sua mensagem')).toHaveValue('Oi de novo');
  });

  it('shows the history read-only when the conversation is closed', () => {
    const closed: ClientConversation = {
      ...conversation,
      status: 'CLOSED',
      closedAt: '2026-10-21T10:00:00.000Z',
    };
    getClientConversation.mockImplementation(async () => closed);

    renderWithProviders(<ConversationView token={TOKEN} initialConversation={closed} />);

    expect(screen.getByText('Quero uma rosa fineline.')).toBeInTheDocument();
    expect(screen.getByText(/Esta conversa foi encerrada/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Sua mensagem')).not.toBeInTheDocument();
  });
});
