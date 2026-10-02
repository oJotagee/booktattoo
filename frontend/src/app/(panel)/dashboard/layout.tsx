import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './_components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="flex min-h-svh w-full flex-col py-4 px-6">{children}</main>
    </SidebarProvider>
  );
}
