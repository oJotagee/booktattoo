import { Mail, MessageCircle } from 'lucide-react';

import { formatMessageDate } from '@/components/conversation/format-message-date';
import { formatPhone } from '@/utils/formatPhone';
import { buttonVariants } from '@/components/ui/button';

interface ClientContactProps {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export function ClientContact({ name, email, phone, createdAt }: ClientContactProps) {
  const digits = phone.replace(/\D/g, '');

  return (
    <section
      aria-label="Dados do cliente"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div>
        <h2 className="font-semibold capitalize">{name}</h2>
        <p className="text-xs text-muted-foreground">
          Pedido aberto em {formatMessageDate(createdAt)}
        </p>
      </div>

      <dl className="grid gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">E-mail</dt>
          <dd className="truncate">{email}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Telefone</dt>
          <dd>{formatPhone(phone)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <a
          href={`https://wa.me/55${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline' })}
        >
          <MessageCircle />
          WhatsApp
        </a>
        <a href={`mailto:${email}`} className={buttonVariants({ variant: 'outline' })}>
          <Mail />
          E-mail
        </a>
      </div>
    </section>
  );
}
