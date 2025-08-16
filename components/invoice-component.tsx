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
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default
      const doc = new jsPDF()

      let yPosition = 20
      const pageWidth = doc.internal.pageSize.width
      const margin = 20

      // Header - Company Name
      doc.setFontSize(24)
      doc.setTextColor(16, 185, 129) // emerald-500
      doc.text("Selection Furniture", margin, yPosition)
      yPosition += 10

      // Company Details
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text("72 Queen's Market, Upton park", margin, yPosition)
      yPosition += 5
      doc.text("E13 9BA", margin, yPosition)
      yPosition += 5
      doc.text("Phone: 07838040902", margin, yPosition)
      yPosition += 15

      // Invoice Title and Details (Right aligned)
      doc.setFontSize(20)
      doc.setTextColor(17, 24, 39) // slate-900
      const invoiceText = "INVOICE"
      const invoiceWidth = doc.getTextWidth(invoiceText)
      doc.text(invoiceText, pageWidth - margin - invoiceWidth, 20)

      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      const invoiceNumText = `Invoice #: ${sale.invoiceNumber}`
      const invoiceNumWidth = doc.getTextWidth(invoiceNumText)
      doc.text(invoiceNumText, pageWidth - margin - invoiceNumWidth, 35)

      const dateText = `Date: ${new Date().toLocaleDateString()}`
      const dateWidth = doc.getTextWidth(dateText)
      doc.text(dateText, pageWidth - margin - dateWidth, 42)

      // Bill To Section
      yPosition = 60
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text("Bill To:", margin, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.text(sale.customerName, margin, yPosition)
      yPosition += 5
      doc.text(sale.customerPhone, margin, yPosition)
      yPosition += 5
      if (sale.customerAddress) {
        const addressLines = sale.customerAddress.split("\n")
        addressLines.forEach((line) => {
          doc.text(line, margin, yPosition)
          yPosition += 5
        })
      }
      yPosition += 10

      // Items Header
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text("Items:", margin, yPosition)
      yPosition += 10

      // Items Table Header
      doc.setFontSize(10)
      doc.text("Qty", margin, yPosition)
      doc.text("Item Name", margin + 30, yPosition)
      doc.text("Unit Price", margin + 120, yPosition)
      doc.text("Total", margin + 160, yPosition)
      yPosition += 8

      // Items
      doc.setTextColor(100, 116, 139)
      sale.items.forEach((item) => {
        doc.text(item.quantity.toString(), margin, yPosition)
        doc.text(item.name, margin + 30, yPosition)
        doc.text(`£${item.price.toFixed(2)}`, margin + 120, yPosition)
        doc.text(`£${(item.price * item.quantity).toFixed(2)}`, margin + 160, yPosition)
        yPosition += 6
      })

      yPosition += 10

      // Summary
      const totalPayments = sale.payments.reduce((sum, payment) => sum + payment.amount, 0)

      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text("Subtotal:", margin + 120, yPosition)
      doc.setTextColor(17, 24, 39)
      doc.text(`£${sale.total.toFixed(2)}`, margin + 160, yPosition)
      yPosition += 6

      doc.setTextColor(100, 116, 139)
      doc.text("Total Payments:", margin + 120, yPosition)
      doc.setTextColor(17, 24, 39)
      doc.text(`£${totalPayments.toFixed(2)}`, margin + 160, yPosition)
      yPosition += 8

      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text("Amount Due:", margin + 120, yPosition)
      doc.setTextColor(sale.amountDue === 0 ? 34 : 239, sale.amountDue === 0 ? 197 : 68, sale.amountDue === 0 ? 94 : 68)
      doc.text(`£${sale.amountDue.toFixed(2)}`, margin + 160, yPosition)
      yPosition += 15

      // Paid in Full Stamp
      if (sale.amountDue === 0) {
        doc.setFontSize(16)
        doc.setTextColor(34, 197, 94) // green-500
        const paidText = "PAID IN FULL"
        const paidWidth = doc.getTextWidth(paidText)
        doc.text(paidText, (pageWidth - paidWidth) / 2, yPosition)
        yPosition += 15
      }

      // Payment History
      if (sale.payments.length > 0) {
        doc.setFontSize(12)
        doc.setTextColor(17, 24, 39)
        doc.text("Payment History:", margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        sale.payments.forEach((payment, index) => {
          const paymentDate =
            typeof payment.date === "string"
              ? new Date(payment.date).toLocaleDateString()
              : payment.date.toDate().toLocaleDateString()
          doc.text(`${index + 1}. £${payment.amount.toFixed(2)} on ${paymentDate}`, margin, yPosition)
          yPosition += 6
        })
        yPosition += 10
      }

      // Footer
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      const footerText1 = "Thank you for your business!"
      const footerWidth1 = doc.getTextWidth(footerText1)
      doc.text(footerText1, (pageWidth - footerWidth1) / 2, yPosition)
      yPosition += 5

      const footerText2 = "For questions about this invoice, please contact us at 07838040902"
      const footerWidth2 = doc.getTextWidth(footerText2)
      doc.text(footerText2, (pageWidth - footerWidth2) / 2, yPosition)

      // Save the PDF
      doc.save(`Invoice-${sale.invoiceNumber}.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
      alert("Failed to generate PDF. Please try again.")
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
                    <td className="py-3 text-right text-slate-600">£{item.price.toFixed(2)}</td>
                    <td className="py-3 text-right text-slate-900 font-medium">
                      £{(item.price * item.quantity).toFixed(2)}
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
                <span className="text-slate-900 font-medium">£{sale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200">
                <span className="text-slate-600">Total Payments:</span>
                <span className="text-slate-900 font-medium">£{totalPayments.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-300 text-lg font-bold">
                <span className="text-slate-900">Amount Due:</span>
                <span className={sale.amountDue === 0 ? "text-green-600" : "text-red-600"}>
                  £{sale.amountDue.toFixed(2)}
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
                      <td className="py-2 text-right text-slate-900">£{payment.amount.toFixed(2)}</td>
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
