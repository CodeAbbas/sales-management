"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { LogOut, User, Armchair } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Armchair className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-lg font-serif font-semibold text-slate-900">
                  Selection Furniture
                </span>
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
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </AuthGuard>
  )
}
