"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User, signOut } from "firebase/auth"
import { SalesDashboard } from "@/components/sales-dashboard"
import { LoginPage } from "@/components/login-page"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-slate-600">Loading Dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="absolute top-4 right-6 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut(auth)}
          className="text-slate-500 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      <SalesDashboard />
    </main>
  )
}
