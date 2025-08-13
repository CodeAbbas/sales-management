"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, DollarSign, FileText, Search } from "lucide-react"
import { AddSaleModal } from "./add-sale-modal"
import { AddPaymentModal } from "./add-payment-modal"
import { InvoiceComponent } from "./invoice-component"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, addDoc, doc, updateDoc, type Timestamp } from "firebase/firestore"

export interface Sale {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  total: number
  amountDue: number
  status: "paid" | "partial"
  delivery: "to-be-delivered" | "delivered"
  payments: Array<{
    date: string | Timestamp
    amount: number
  }>
  invoiceNumber: string
}

export function SalesDashboard() {
  const [sales, setSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false)
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null)
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null)

  useEffect(() => {
    const salesCollectionRef = collection(db, "sales")
    const unsubscribe = onSnapshot(salesCollectionRef, (snapshot) => {
      const salesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[]
      setSales(salesData)
    })

    return () => unsubscribe()
  }, [])

  const filteredSales = sales.filter((sale) => sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddSale = async (newSaleData: Omit<Sale, "id" | "invoiceNumber">) => {
    try {
      const salesCollectionRef = collection(db, "sales")
      const newInvoiceNumber = `INV-${String(sales.length + 1).padStart(3, "0")}`
      await addDoc(salesCollectionRef, { ...newSaleData, invoiceNumber: newInvoiceNumber })
      setIsAddSaleOpen(false)
    } catch (error) {
      console.error("Error adding sale: ", error)
    }
  }

  const handleAddPayment = async (saleId: string, amount: number) => {
    const saleToUpdate = sales.find((s) => s.id === saleId)
    if (!saleToUpdate) return

    const saleRef = doc(db, "sales", saleId)
    const newAmountDue = Math.max(0, saleToUpdate.amountDue - amount)
    const newStatus = newAmountDue === 0 ? "paid" : "partial"
    const newPayment = { date: new Date().toISOString().split("T")[0], amount }

    try {
      await updateDoc(saleRef, {
        amountDue: newAmountDue,
        status: newStatus,
        payments: [...saleToUpdate.payments, newPayment],
      })
      setSelectedSaleForPayment(null)
    } catch (error) {
      console.error("Error adding payment: ", error)
    }
  }

  const handleDeliveryChange = async (saleId: string, delivery: "to-be-delivered" | "delivered") => {
    const saleRef = doc(db, "sales", saleId)
    try {
      await updateDoc(saleRef, { delivery })
    } catch (error) {
      console.error("Error updating delivery status: ", error)
    }
  }

  const exportToCSV = () => {
    const headers = ["Customer", "Phone", "Total", "Amount Due", "Status", "Delivery"]
    const csvContent = [
      headers.join(","),
      ...sales.map((sale) =>
        [sale.customerName, sale.customerPhone, sale.total, sale.amountDue, sale.status, sale.delivery].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sales-data.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Sales Management Dashboard</h1>
          <div className="flex gap-3">
            <Button onClick={() => setIsAddSaleOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Sale
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Sales Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{sale.customerName}</div>
                        <div className="text-sm text-slate-500">{sale.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={sale.amountDue > 0 ? "text-red-600 font-medium" : "text-slate-600"}>
                        ${sale.amountDue.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sale.status === "paid" ? "default" : "secondary"}
                        className={
                          sale.status === "paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }
                      >
                        {sale.status === "paid" ? "Paid" : "Partial"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sale.delivery}
                        onValueChange={(value: "to-be-delivered" | "delivered") => handleDeliveryChange(sale.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="to-be-delivered">To be Delivered</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSaleForPayment(sale)}
                          disabled={sale.amountDue === 0}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedSaleForInvoice(sale)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddSaleModal isOpen={isAddSaleOpen} onClose={() => setIsAddSaleOpen(false)} onSave={handleAddSale} />

      {selectedSaleForPayment && (
        <AddPaymentModal
          sale={selectedSaleForPayment}
          onClose={() => setSelectedSaleForPayment(null)}
          onSave={handleAddPayment}
        />
      )}

      {selectedSaleForInvoice && (
        <InvoiceComponent sale={selectedSaleForInvoice} onClose={() => setSelectedSaleForInvoice(null)} />
      )}
    </div>
  )
}
