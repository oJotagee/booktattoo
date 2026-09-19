import { LogIn } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from '@/components/ui/avatar';
import { clsx } from 'cn';

interface NavLinksProps {
  navItems: { href: string; label: string }[];
  session: Session | null;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export function NavLinks({ navItems, session, setIsMenuOpen }: NavLinksProps) {
  const imageUser = session?.user?.image ?? undefined;
  const initialsUser = session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? 'CN';
  const statusUser = session?.user?.status ?? 'offline';

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
          className="flex items-center justify-center gap-2 text-white shadow-none text-base hover:brightness-75 duration-300"
        >
          <Avatar>
            <AvatarImage src={imageUser} />
            <AvatarFallback>{initialsUser}</AvatarFallback>
            <AvatarBadge className={clsx({
              'bg-green-500': statusUser === 'ACTIVE',
              'bg-red-500': statusUser === 'INACTIVE',
              'bg-yellow-500': statusUser === 'VACATION',
            })} />
          </Avatar>
          Dashboard
        </Link>
      ) : (
        <Button
          className="flex items-center justify-center gap-2 cursor-pointer bg-orange-600 text-white hover:brightness-75 duration-300 py-1 px-4 rounded-md font-semibold"
          render={<Link href="/login" />}
          nativeButton={false}
        >
          <LogIn />
          Painel
        </Button>
      )}
    </>
  );
}
