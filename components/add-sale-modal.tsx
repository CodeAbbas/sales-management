"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Sale } from "./sales-dashboard"

interface AddSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sale: Omit<Sale, "id" | "invoiceNumber">) => void
}

interface Item {
  name: string
  price: number
  quantity: number
}

export function AddSaleModal({ isOpen, onClose, onSave }: AddSaleModalProps) {
  const [step, setStep] = useState(1)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [items, setItems] = useState<Item[]>([{ name: "", price: 0, quantity: 1 }])
  const [deposit, setDeposit] = useState(0)

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const amountDue = Math.max(0, totalPrice - deposit)

  const handleAddItem = () => {
    setItems([...items, { name: "", price: 0, quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleSave = () => {
    if (!customerName || !customerPhone || items.some((item) => !item.name || item.price <= 0)) {
      return
    }

    const sale: Omit<Sale, "id" | "invoiceNumber"> = {
      customerName,
      customerPhone,
      customerAddress,
      items,
      total: totalPrice,
      amountDue,
      status: amountDue === 0 ? "paid" : "partial",
      delivery: "to-be-delivered",
      payments:
        deposit > 0
          ? [
              {
                date: new Date().toISOString().split("T")[0],
                amount: deposit,
              },
            ]
          : [],
    }

    onSave(sale)
    handleReset()
  }

  const handleReset = () => {
    setStep(1)
    setCustomerName("")
    setCustomerPhone("")
    setCustomerAddress("")
    setItems([{ name: "", price: 0, quantity: 1 }])
    setDeposit(0)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Add New Sale</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && <div className="w-12 h-0.5 bg-slate-200 mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter customer address"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Items</h3>
                <Button onClick={handleAddItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        placeholder="Enter item name"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(index, "price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        onClick={() => handleRemoveItem(index)}
                        size="sm"
                        variant="outline"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Payment Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Summary</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span className="font-medium">£{totalPrice.toFixed(2)}</span>
                </div>
                <div>
                  <Label htmlFor="deposit">Initial Deposit</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={deposit || ""}
                    onChange={(e) => setDeposit(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    max={totalPrice}
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between text-lg font-medium">
                  <span>Amount Due:</span>
                  <span className={amountDue > 0 ? "text-red-600" : "text-green-600"}>£{amountDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {step > 1 && (
                <Button onClick={() => setStep(step - 1)} variant="outline">
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!customerName || !customerPhone)) ||
                    (step === 2 && items.some((item) => !item.name || item.price <= 0))
                  }
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                  Save Sale
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
