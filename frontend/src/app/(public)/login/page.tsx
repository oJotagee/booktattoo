import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { AuthCard } from './_components/auth-card';
import HeroImg from '../../../../public/hero.jpg';
import { auth } from '@/lib/auth';

export default async function Login() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="relative hidden w-1/2 lg:block">
        <Image src={HeroImg.src} alt="" quality={75} priority fill className="object-cover" />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="font-bold text-2xl">
            Book
            <span className="text-orange-600">Tattoo</span>
          </Link>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <AuthCard />
      </div>
    </div>
  );
}
