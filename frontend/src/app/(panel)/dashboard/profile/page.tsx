import getSession from '@/lib/get-session';
import type { UserStatus } from '../_actions/update-status';
import DashboardHeader from '../_components/header';
import { ProfileForm } from './_components/form';

export default async function Profile() {
  const session = await getSession();

  const user = {
    name: session?.user?.name ?? '',
    image: session?.user?.image ?? null,
    address: session?.user?.address ?? null,
    phone: session?.user?.phone ?? null,
    bio: session?.user?.bio ?? null,
    times: session?.user?.times ?? null,
    status: session?.user?.status as UserStatus,
  };

  return (
    <>
      <DashboardHeader title="Meu Perfil" subtitle="Gerencie suas informações de artista" />
      <ProfileForm user={user} />
    </>
  );
}
