"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { LogOut, User, Armchair, LayoutDashboard, UserCog } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Sales", icon: LayoutDashboard },
    { href: "/dashboard/admin", label: "Admin", icon: UserCog },
  ]

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Brand */}
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Armchair className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-lg font-serif font-semibold text-slate-900">
                    Selection Furniture
                  </span>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="hidden sm:inline">
                    {user?.displayName || user?.email || "Admin"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex md:hidden items-center gap-1 pb-3 -mx-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </AuthGuard>
  )
}
