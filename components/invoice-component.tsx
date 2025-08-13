"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import type { Sale } from "./sales-dashboard"

interface InvoiceComponentProps {
  sale: Sale
  onClose: () => void
}

export function InvoiceComponent({ sale, onClose }: InvoiceComponentProps) {
  const handleDownloadPDF = async () => {
    try {
      const html2pdf = await import("html2pdf.js")

      const element = document.getElementById("invoice-content")
      if (!element) {
        console.error("Invoice content element not found")
        return
      }

      const options = {
        filename: `Invoice-${sale.invoiceNumber}.pdf`,
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      }

      // Use html2pdf directly without .default
      await html2pdf.default(element, options)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const totalPayments = sale.payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold">Invoice Preview</h2>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white p-8 border rounded-lg" id="invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-emerald-600">Selection Furniture</h1>
              <div className="text-slate-600 mt-2">
                <p>72 Queen's Market, Upton park</p>
                <p>E13 9BA</p>
                <p>Phone:07838040902</p>
                <p>Email: </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">INVOICE</h2>
              <p className="text-slate-600">Invoice #: {sale.invoiceNumber}</p>
              <p className="text-slate-600">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Bill To:</h3>
            <div className="text-slate-600">
              <p className="font-medium">{sale.customerName}</p>
              <p>{sale.customerPhone}</p>
              {sale.customerAddress && <p className="whitespace-pre-line">{sale.customerAddress}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 font-medium text-slate-900">Quantity</th>
                  <th className="text-left py-3 font-medium text-slate-900">Item Name</th>
                  <th className="text-right py-3 font-medium text-slate-900">Unit Price</th>
                  <th className="text-right py-3 font-medium text-slate-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="py-3 text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-slate-900">{item.name}</td>
                    <td className="py-3 text-right text-slate-600">${item.price.toFixed(2)}</td>
                    <td className="py-3 text-right text-slate-900 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Subtotal:</span>
                <span className="text-slate-900 font-medium">${sale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200">
                <span className="text-slate-600">Total Payments:</span>
                <span className="text-slate-900 font-medium">${totalPayments.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-300 text-lg font-bold">
                <span className="text-slate-900">Amount Due:</span>
                <span className={sale.amountDue === 0 ? "text-green-600" : "text-red-600"}>
                  ${sale.amountDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {sale.amountDue === 0 && (
            <div className="text-center">
              <div className="inline-block bg-green-100 text-green-800 px-8 py-4 rounded-lg border-2 border-green-300">
                <span className="text-2xl font-bold">PAID IN FULL</span>
              </div>
            </div>
          )}

          {/* Payment History */}
          {sale.payments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Payment History</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">Date</th>
                    <th className="text-right py-2 font-medium text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.payments.map((payment, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600">
                        {typeof payment.date === "string"
                          ? new Date(payment.date).toLocaleDateString()
                          : payment.date.toDate().toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right text-slate-900">${payment.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
            <p>Thank you for your business!</p>
            <p>For questions about this invoice, please contact us at 07838040902</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
