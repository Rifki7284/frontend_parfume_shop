"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, ShoppingBag, TrendingUp, Menu, Package } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Data TikTok",
    href: "/admin/tiktok",
    icon: TrendingUp,
  },
  {
    title: "Data Shopee",
    href: "/admin/shopee",
    icon: ShoppingBag,
  },
  {
    title: "Produk",
    href: "/admin/product",
    icon: Package,
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: ShoppingBag,
  },

]

interface AdminSidebarProps {
  className?: string
}

function EchoLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-full border-r-transparent animate-pulse" />
        </div>
      </div>
      <span className="text-xl font-bold text-slate-900">Echo</span>
    </div>
  )
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 bg-white", className)}>
      <div className="space-y-4 py-6">
        <div className="px-6 py-4">
          <div className="mb-8">
            <EchoLogo />
            <p className="text-sm text-slate-500 mt-1">Admin Panel</p>
          </div>

          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-white">
        <div className="pb-12 h-screen">
          <div className="space-y-4 py-6">
            <div className="px-6 py-4">
              <div className="mb-8">
                <EchoLogo />
                <p className="text-sm text-slate-500 mt-1">Admin Panel</p>
              </div>

              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
