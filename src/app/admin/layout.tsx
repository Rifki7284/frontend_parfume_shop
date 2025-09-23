import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <div className="flex">
        <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white z-40 overflow-y-auto">
          <AdminSidebar />
        </aside>
        <main className="flex-1 md:ml-64 p-4 sm:p-6 overflow-x-auto bg-white">{children}</main>
      </div>
    </div>
  )
}
