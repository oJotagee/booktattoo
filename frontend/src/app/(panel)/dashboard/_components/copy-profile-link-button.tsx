'use client';

import { Check, Link2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

const COPIED_FEEDBACK_MS = 2000;

export function CopyProfileLinkButton() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const artistId = session?.user?.id;

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (!artistId) return;

    const link = `${window.location.origin}/${artistId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copiado! Envie para seus clientes agendarem.');
    } catch {
      toast.error(`Não foi possível copiar automaticamente. Seu link: ${link}`);
    }
  }

  return (
    <Button
      variant="outline"
      className="cursor-pointer"
      disabled={!artistId}
      onClick={handleCopy}
      aria-label="Copiar o link da minha página de agendamento"
    >
      {copied ? <Check className="text-green-500" /> : <Link2 />}
      <span className="hidden sm:inline">{copied ? 'Link copiado' : 'Copiar meu link'}</span>
    </Button>
  );
}
