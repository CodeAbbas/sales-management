"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Wallet,
  Truck,
  Users,
  Plus,
  Minus,
  Phone,
  MapPin,
  Edit2,
  Package,
  PoundSterling,
  Save,
  X,
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import type { Sale } from "@/components/sales-dashboard"
import type { Timestamp } from "firebase/firestore"

interface ShopCash {
  amount: number
  lastUpdated: string
  history: Array<{
    type: "add" | "withdraw"
    amount: number
    note: string
    date: string
  }>
}

interface Wholesaler {
  id: string
  name: string
  phones: string[]
  pendingDelivery: string
  owedAmount: number
  notes: string
}

const initialWholesalers: Omit<Wholesaler, "id">[] = [
  { name: "Alba", phones: ["07748 316493"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Daniyal", phones: ["07478667677"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Sliding", phones: ["07411922368"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "7 Star", phones: ["07539309464", "02089043006"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "11 Star", phones: ["07792539590"], pendingDelivery: "", owedAmount: 0, notes: "High gloss" },
  { name: "Ms Furniture", phones: ["07949486198"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Fakhruddin", phones: ["07977816185"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Homingly", phones: ["07456661379", "07878654274"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Purane Srdr", phones: ["07522022692"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Yusuf Matt", phones: ["07748607428"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Jaher", phones: ["07969685324"], pendingDelivery: "", owedAmount: 0, notes: "" },
  { name: "Arfan", phones: ["07594162875"], pendingDelivery: "", owedAmount: 0, notes: "" },
]

export default function AdminPage() {
  const [shopCash, setShopCash] = useState<ShopCash>({
    amount: 0,
    lastUpdated: new Date().toISOString(),
    history: [],
  })
  const [cashModalOpen, setCashModalOpen] = useState(false)
  const [cashAction, setCashAction] = useState<"add" | "withdraw">("add")
  const [cashAmount, setCashAmount] = useState("")
  const [cashNote, setCashNote] = useState("")

  const [upcomingDeliveries, setUpcomingDeliveries] = useState<Sale[]>([])
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [editingWholesaler, setEditingWholesaler] = useState<Wholesaler | null>(null)
  const [wholesalerModalOpen, setWholesalerModalOpen] = useState(false)

  // Fetch shop cash from Firestore
  useEffect(() => {
    const shopCashRef = doc(db, "settings", "shopCash")
    const unsubscribe = onSnapshot(shopCashRef, (snapshot) => {
      if (snapshot.exists()) {
        setShopCash(snapshot.data() as ShopCash)
      }
    })
    return () => unsubscribe()
  }, [])

  // Fetch sales for upcoming deliveries
  useEffect(() => {
    const salesRef = collection(db, "sales")
    const unsubscribe = onSnapshot(salesRef, (snapshot) => {
      const salesData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Sale))
        .filter((sale) => sale.delivery === "to-be-delivered")
      setUpcomingDeliveries(salesData)
    })
    return () => unsubscribe()
  }, [])

  // Fetch wholesalers from Firestore
  useEffect(() => {
    const wholesalersRef = collection(db, "wholesalers")
    const unsubscribe = onSnapshot(wholesalersRef, async (snapshot) => {
      if (snapshot.empty) {
        // Initialize with default wholesalers
        for (const ws of initialWholesalers) {
          await addDoc(wholesalersRef, ws)
        }
      } else {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Wholesaler[]
        setWholesalers(data)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleCashUpdate = async () => {
    const amount = parseFloat(cashAmount)
    if (isNaN(amount) || amount <= 0) return

    const newAmount = cashAction === "add" ? shopCash.amount + amount : shopCash.amount - amount
    const newHistory = [
      ...shopCash.history,
      {
        type: cashAction,
        amount,
        note: cashNote,
        date: new Date().toISOString(),
      },
    ]

    try {
      await setDoc(doc(db, "settings", "shopCash"), {
        amount: Math.max(0, newAmount),
        lastUpdated: new Date().toISOString(),
        history: newHistory.slice(-50), // Keep last 50 transactions
      })
      setCashModalOpen(false)
      setCashAmount("")
      setCashNote("")
    } catch (error) {
      console.error("Error updating shop cash:", error)
    }
  }

  const handleWholesalerSave = async () => {
    if (!editingWholesaler) return

    try {
      const { id, ...data } = editingWholesaler
      await updateDoc(doc(db, "wholesalers", id), data)
      setWholesalerModalOpen(false)
      setEditingWholesaler(null)
    } catch (error) {
      console.error("Error updating wholesaler:", error)
    }
  }

  const openCashModal = (action: "add" | "withdraw") => {
    setCashAction(action)
    setCashModalOpen(true)
  }

  const openWholesalerEdit = (wholesaler: Wholesaler) => {
    setEditingWholesaler({ ...wholesaler })
    setWholesalerModalOpen(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Dashboard</h1>

      {/* Shop Cash Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Shop Cash
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => openCashModal("add")} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => openCashModal("withdraw")}>
              <Minus className="w-4 h-4 mr-1" />
              Withdraw
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-slate-900">
              £{shopCash.amount.toFixed(2)}
            </div>
            <div className="text-sm text-slate-500">
              Last updated: {new Date(shopCash.lastUpdated).toLocaleDateString()}
            </div>
          </div>
          {shopCash.history.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Transactions</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {shopCash.history.slice(-5).reverse().map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={entry.type === "add" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {entry.type === "add" ? "+" : "-"}£{entry.amount.toFixed(2)}
                      </Badge>
                      <span className="text-slate-600">{entry.note || "No note"}</span>
                    </div>
                    <span className="text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Deliveries Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-500" />
            Upcoming Deliveries
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
              {upcomingDeliveries.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDeliveries.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No pending deliveries</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900">{delivery.customerName}</div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {delivery.customerPhone}
                      </span>
                      {delivery.customerAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {delivery.customerAddress}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right">
                    <div className="font-medium text-slate-900">£{delivery.total.toFixed(2)}</div>
                    <div className={delivery.amountDue > 0 ? "text-red-600 text-sm" : "text-green-600 text-sm"}>
                      Due: £{delivery.amountDue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wholesalers Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Wholesalers Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone(s)</TableHead>
                  <TableHead>Pending Delivery</TableHead>
                  <TableHead>Owed Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wholesalers.map((wholesaler) => (
                  <TableRow key={wholesaler.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{wholesaler.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {wholesaler.phones.map((phone, idx) => (
                          <a
                            key={idx}
                            href={`tel:${phone.replace(/\s/g, "")}`}
                            className="text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {phone}
                          </a>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {wholesaler.pendingDelivery ? (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Package className="w-3 h-3 mr-1" />
                          {wholesaler.pendingDelivery}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {wholesaler.owedAmount > 0 ? (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <PoundSterling className="w-3 h-3" />
                          {wholesaler.owedAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">£0.00</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{wholesaler.notes || "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => openWholesalerEdit(wholesaler)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cash Update Modal */}
      <Dialog open={cashModalOpen} onOpenChange={setCashModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cashAction === "add" ? "Add Cash" : "Withdraw Cash"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cashAmount">Amount (£)</Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                min="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="cashNote">Note (optional)</Label>
              <Input
                id="cashNote"
                value={cashNote}
                onChange={(e) => setCashNote(e.target.value)}
                placeholder="e.g., Customer payment, supplies purchase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCashUpdate}
              className={cashAction === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
            >
              {cashAction === "add" ? "Add Cash" : "Withdraw Cash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wholesaler Edit Modal */}
      <Dialog open={wholesalerModalOpen} onOpenChange={setWholesalerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Wholesaler: {editingWholesaler?.name}</DialogTitle>
          </DialogHeader>
          {editingWholesaler && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="pendingDelivery">Pending Delivery</Label>
                <Input
                  id="pendingDelivery"
                  value={editingWholesaler.pendingDelivery}
                  onChange={(e) =>
                    setEditingWholesaler({ ...editingWholesaler, pendingDelivery: e.target.value })
                  }
                  placeholder="e.g., 2x Sofa, 1x Table"
                />
              </div>
              <div>
                <Label htmlFor="owedAmount">Owed Amount (£)</Label>
                <Input
                  id="owedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingWholesaler.owedAmount || ""}
                  onChange={(e) =>
                    setEditingWholesaler({
                      ...editingWholesaler,
                      owedAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editingWholesaler.notes}
                  onChange={(e) => setEditingWholesaler({ ...editingWholesaler, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setWholesalerModalOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleWholesalerSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
