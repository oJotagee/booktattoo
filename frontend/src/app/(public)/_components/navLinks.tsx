import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface NavLinksProps {
  navItems: { href: string; label: string }[];
  session: any;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export function NavLinks({ navItems, session, setIsMenuOpen }: NavLinksProps) {
  async function handleRegister(provider: string) {
    await signIn(provider, { redirectTo: '/dashboard' });
  }

  return (
    <>
      {navItems.map((item) => (
        <Button
          key={item.href}
          className="shadow-none text-base hover:brightness-75 duration-300"
          variant={'ghost'}
          render={<Link href={item.href} />}
          nativeButton={false}
          onClick={() => setIsMenuOpen(false)}
        >
          {item.label}
        </Button>
      ))}

      {session ? (
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 bg-orange-600 text-white hover:brightness-75 duration-300 py-1 px-4 rounded-md font-semibold"
        >
          Acessar painel
        </Link>
      ) : (
        <Button
          className="flex items-center justify-center gap-2 cursor-pointer bg-orange-600 text-white hover:brightness-75 duration-300 py-1 px-4 rounded-md font-semibold"
          onClick={() => handleRegister('github')}
        >
          <LogIn />
          Painel
        </Button>
      )}
    </>
  );
}
