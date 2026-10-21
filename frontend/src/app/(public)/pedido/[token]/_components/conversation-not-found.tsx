import { MessageSquareOff } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function ConversationNotFound() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 px-6 py-16 text-center">
      <MessageSquareOff className="size-8 text-orange-600" />
      <h1 className="text-2xl font-semibold text-white">Conversa não encontrada</h1>
      <p className="max-w-md text-sm text-white/50">
        O link pode estar incompleto. Confira se você copiou o endereço inteiro do e-mail que
        recebeu.
      </p>
      <Button
        variant="outline"
        className="cursor-pointer"
        render={<Link href="/artists" />}
        nativeButton={false}
      >
        Ver tatuadores
      </Button>
    </section>
  );
}
