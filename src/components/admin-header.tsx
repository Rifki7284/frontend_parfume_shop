"use client"

import { MobileAdminSidebar } from "./admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
const BellIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573 1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const LogOutIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const Clock = () => {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) {
    return (
      <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-md">
        --:--:--
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-md">
      {time.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </div>
  )
}


export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
          </VisuallyHidden>
          <DialogDescription>
            Apakah Anda yakin ingin keluar dari sistem admin?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <LogOutIcon />
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Batal
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Ya, Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminHeader() {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out")
    signOut({ callbackUrl: "/" })
    setShowLogoutModal(false)

  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center px-6">
          <div className="mr-4 md:hidden">
            <MobileAdminSidebar />
          </div>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-slate-900 md:hidden">Echo Admin</h1>
              <div className="hidden md:flex relative items-center">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </div>
                <Input
                  placeholder="Search..."
                  className="pl-10 w-80 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </div>

            <nav className="flex items-center space-x-2">
              <Clock />

              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100">
                <BellIcon />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100">
                <SettingsIcon />
                <span className="sr-only">Settings</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100">
                <UserIcon />
                <span className="sr-only">User menu</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOutIcon />
                <span className="sr-only">Logout</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
    </>
  )
}
