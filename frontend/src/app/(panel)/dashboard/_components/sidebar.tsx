'use client';

import { ChevronLeft, Gauge, Scissors, Star, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/dashboard/services', label: 'Serviços', icon: Scissors },
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
  { href: '/dashboard/plans', label: 'Planos', icon: Star },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4 px-2">
        <Link
          href="/dashboard"
          className="font-bold text-2xl px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:text-center"
        >
          <span className="group-data-[collapsible=icon]:hidden">
            Book<span className="text-orange-600">Ink</span>
          </span>
          <span className="hidden group-data-[collapsible=icon]:inline text-orange-600">
            B
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Painel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='hidden md:block'>
        <Button
          variant="outline"
          size="icon"
          className="mx-auto w-full cursor-pointer"
          onClick={toggleSidebar}
        >
          <ChevronLeft className="group-data-[collapsible=icon]:rotate-180" />
          <span className="sr-only">Recolher sidebar</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
