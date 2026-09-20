'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NavLinks } from './navLinks';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navItems = [
    { href: '/flash', label: 'Flash' },
    { href: '/artistas', label: 'Artistas' },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full py-4 px-6 bg-black">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link href="/" className="font-bold text-2xl">
          Book
          <span className="text-orange-600">Tattoo</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4">
          <NavLinks navItems={navItems} session={session} setIsMenuOpen={setIsMenuOpen} />
        </nav>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button className="text-white hover:bg-transparent" variant={'ghost'} size={'icon'} />
            }
          >
            <Menu className="w-8 h-8" />
          </SheetTrigger>

          <SheetContent side="right" className="w-[240px] sm:w-[300px] z-[9999]">
            <SheetHeader>
              <SheetTitle className="font-bold">Menu</SheetTitle>
              <SheetDescription>Veja nossos links.</SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col space-y-4 mt-6 px-4">
              <NavLinks navItems={navItems} session={session} setIsMenuOpen={setIsMenuOpen} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
