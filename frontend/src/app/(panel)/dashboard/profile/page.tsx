import { type CurrentUser, getCurrentUser } from '../_data-access/get-current-user';
import type { UserStatus } from '../_actions/update-status';
import DashboardHeader from '../_components/header';
import { ProfileForm } from './_components/form';
import getSession from '@/lib/get-session';

async function loadUser(): Promise<Omit<CurrentUser, 'id'>> {
  try {
    return await getCurrentUser();
  } catch {
    const session = await getSession();

    return {
      name: session?.user?.name ?? '',
      image: session?.user?.image ?? null,
      address: session?.user?.address ?? null,
      showAddress: false,
      phone: session?.user?.phone ?? null,
      bio: session?.user?.bio ?? null,
      role: session?.user?.role ?? null,
      times: session?.user?.times ?? [],
      status: session?.user?.status as UserStatus,
      paymentsEnabled: false,
    };
  }
}

export default async function Profile() {
  const user = await loadUser();

  return (
    <>
      <DashboardHeader title="Meu Perfil" subtitle="Gerencie suas informações de artista" />

      <h1 className="text-xl font-bold md:hidden">Meu Perfil</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">Gerencie suas informações de artista</h2>

      <ProfileForm user={user} />
    </>
  );
}
