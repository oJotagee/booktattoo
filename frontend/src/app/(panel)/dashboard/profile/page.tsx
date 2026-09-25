import type { UserStatus } from '../_actions/update-status';
import DashboardHeader from '../_components/header';
import { ProfileForm } from './_components/form';
import getSession from '@/lib/get-session';

export default async function Profile() {
  const session = await getSession();

  const user = {
    name: session?.user?.name ?? '',
    image: session?.user?.image ?? null,
    address: session?.user?.address ?? null,
    phone: session?.user?.phone ?? null,
    bio: session?.user?.bio ?? null,
    role: session?.user?.role ?? null,
    times: session?.user?.times ?? null,
    status: session?.user?.status as UserStatus,
  };

  return (
    <>
      <DashboardHeader title="Meu Perfil" subtitle="Gerencie suas informações de artista" />

      <h1 className="text-xl font-bold md:hidden">Meu Perfil</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">Gerencie suas informações de artista</h2>

      <ProfileForm user={user} />
    </>
  );
}
