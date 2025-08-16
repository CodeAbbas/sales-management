"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Sale } from "./sales-dashboard"

interface AddPaymentModalProps {
  sale: Sale
  onClose: () => void
  onSave: (saleId: string, amount: number) => void
}

export function AddPaymentModal({ sale, onClose, onSave }: AddPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number>(0)

  const handleSave = () => {
    if (paymentAmount > 0 && paymentAmount <= sale.amountDue) {
      onSave(sale.id, paymentAmount)
      setPaymentAmount(0)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Add Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-medium text-slate-900">{sale.customerName}</h3>
            <p className="text-sm text-slate-600">{sale.customerPhone}</p>
            <p className="text-lg font-medium text-red-600 mt-2">Amount Due: £{sale.amountDue.toFixed(2)}</p>
          </div>

          {/* Previous Payments */}
          {sale.payments.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Previous Payments</h4>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {typeof payment.date === "string"
                            ? new Date(payment.date).toLocaleDateString()
                            : payment.date.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell>£{payment.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* New Payment */}
          <div>
            <Label htmlFor="paymentAmount">New Payment Amount</Label>
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount || ""}
              onChange={(e) => setPaymentAmount(Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              max={sale.amountDue}
              step="0.01"
            />
            <p className="text-sm text-slate-500 mt-1">Maximum: £{sale.amountDue.toFixed(2)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={paymentAmount <= 0 || paymentAmount > sale.amountDue}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Record Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
