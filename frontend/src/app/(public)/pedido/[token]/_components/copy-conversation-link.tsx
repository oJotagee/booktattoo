'use client';

import { Bookmark, Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

const COPIED_FEEDBACK_MS = 2000;

export function CopyConversationLink() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    const link = window.location.href;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link da conversa copiado');
    } catch {
      toast.error(`Não foi possível copiar automaticamente. Seu link: ${link}`);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-600/30 bg-orange-600/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-3 text-sm text-white/70">
        <Bookmark className="mt-0.5 size-4 shrink-0 text-orange-600" />
        <span>
          Salve este link para voltar à conversa. Ele também foi enviado para o seu e-mail.
        </span>
      </p>
      <Button variant="outline" className="shrink-0 cursor-pointer" onClick={handleCopy}>
        {copied ? <Check className="text-green-500" /> : <Copy />}
        {copied ? 'Link copiado' : 'Copiar link'}
      </Button>
    </div>
  );
}
