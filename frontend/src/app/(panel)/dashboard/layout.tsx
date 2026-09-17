import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./_components/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="w-full py-4 px-6">
        {children}
      </main>
    </SidebarProvider>
  )
}