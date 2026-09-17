import getSession from "@/lib/get-session"

import { Menu } from "./menu"
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export default async function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const session = await getSession()

  const image = session?.user?.image ?? undefined;
  const initialsUser = session?.user?.name?.split(' ').map(n => n[0]).join('') ?? 'CN';
  const status = session?.user?.status

  return (
    <header className="flex flex-row justify-between gap-4 mb-8">
      <SidebarTrigger className="m-2 md:hidden" />
      <div className="hidden md:block">
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
        {subtitle && <h2 className="text-white/30 text-sm md:text-base">{subtitle}</h2>}
      </div>

      <Menu
        name={session?.user?.name ?? 'User'}
        image={image}
        initials={initialsUser}
        status={status}
      />
    </header>
  );
}