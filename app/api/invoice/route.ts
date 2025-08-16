import type { NextRequest } from "next/server"
import PDFDocument from "pdfkit"

export const runtime = "nodejs" // ✅ Force Node.js runtime

export async function POST(req: NextRequest) {
  try {
    const sale = await req.json()

    if (!sale || !sale.invoiceNumber) {
      return new Response("Invalid sale data", { status: 400 })
    }

    // PDF setup
    const doc = new PDFDocument({ size: "A4", margin: 40 })
    const chunks: Buffer[] = []

    doc.on("data", (chunk) => chunks.push(chunk))

    const done = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)))
    })

    // Colors
    const emerald = "#10b981"
    const slate900 = "#0f172a"
    const slate600 = "#64748b"
    const slate300 = "#cbd5e1"
    const green = "#22c55e"
    const red = "#ef4444"

    const pageWidth = doc.page.width
    const rightX = pageWidth - doc.page.margins.right
    let y = 50

    // 🧾 Header - Company Info (Left) and Invoice Title (Right)
    doc.fontSize(24).fillColor(emerald).text("Selection Furniture", 50, y)

    // Invoice title (right aligned)
    doc.fontSize(20).fillColor(slate900).text("INVOICE", 0, y, { align: "right" })

    y += 15
    doc.fontSize(10).fillColor(slate600).text("72 Queen's Market, Upton Park", 50, y)
    doc.text(`Invoice #: ${sale.invoiceNumber}`, { align: "right" })

    y += 12
    doc.text("E13 9BA", 50, y)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })

    y += 12
    doc.text("Phone: 07838040902", 50, y)

    y += 12
    doc.text("Email: ", 50, y)

    // Customer info
    y += 30
    doc.fontSize(12).fillColor(slate900).text("Bill To:", 50, y)

    y += 15
    doc.fontSize(10).fillColor(slate900).text(sale.customerName, 50, y)

    y += 12
    doc.fillColor(slate600).text(sale.customerPhone, 50, y)

    if (sale.customerAddress) {
      y += 12
      const addressLines = sale.customerAddress.split("\n")
      addressLines.forEach((line: string) => {
        doc.text(line, 50, y)
        y += 12
      })
    }

    // Items table
    y += 20
    const tableTop = y
    const colX = [50, 120, pageWidth - 180, pageWidth - 80]
    const rowHeight = 20

    // Table header
    doc.strokeColor(slate300).lineWidth(1)
    doc
      .moveTo(50, tableTop - 5)
      .lineTo(rightX, tableTop - 5)
      .stroke()

    doc.fontSize(10).fillColor(slate900).text("Quantity", colX[0], tableTop)
    doc.text("Item Name", colX[1], tableTop)
    doc.text("Unit Price", colX[2], tableTop, { width: 80, align: "right" })
    doc.text("Total", colX[3], tableTop, { width: 60, align: "right" })

    y += rowHeight
    doc
      .moveTo(50, y - 5)
      .lineTo(rightX, y - 5)
      .stroke()

    // Table body
    doc.fontSize(10).fillColor(slate600)
    sale.items.forEach((item: any) => {
      doc.text(String(item.quantity), colX[0], y)
      doc.fillColor(slate900).text(item.name, colX[1], y, { width: colX[2] - colX[1] - 10 })
      doc.fillColor(slate600).text(`£${item.price.toFixed(2)}`, colX[2], y, { width: 80, align: "right" })
      doc
        .fillColor(slate900)
        .text(`£${(item.price * item.quantity).toFixed(2)}`, colX[3], y, { width: 60, align: "right" })

      y += rowHeight
      doc
        .strokeColor(slate300)
        .moveTo(50, y - 5)
        .lineTo(rightX, y - 5)
        .stroke()
    })

    // Summary
    y += 20
    const summaryX = pageWidth - 180
    const totalPayments = sale.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)

    doc.fontSize(10).fillColor(slate600).text("Subtotal:", summaryX, y)
    doc.fillColor(slate900).text(`£${sale.total.toFixed(2)}`, rightX, y, { align: "right" })

    y += 15
    doc
      .strokeColor(slate300)
      .moveTo(summaryX, y - 5)
      .lineTo(rightX, y - 5)
      .stroke()

    doc.fillColor(slate600).text("Total Payments:", summaryX, y)
    doc.fillColor(slate900).text(`£${totalPayments.toFixed(2)}`, rightX, y, { align: "right" })

    y += 15
    doc
      .lineWidth(2)
      .moveTo(summaryX, y - 5)
      .lineTo(rightX, y - 5)
      .stroke()

    doc.fontSize(12).fillColor(slate900).text("Amount Due:", summaryX, y)
    doc
      .fillColor(sale.amountDue === 0 ? green : red)
      .text(`£${sale.amountDue.toFixed(2)}`, rightX, y, { align: "right" })

    // Paid in Full stamp
    if (sale.amountDue === 0) {
      y += 25
      doc.fontSize(16).fillColor(green).text("PAID IN FULL", 0, y, { align: "center" })
    }

    // Payment History
    if (sale.payments.length > 0) {
      y += 30
      doc.strokeColor(slate300).moveTo(50, y).lineTo(rightX, y).stroke()

      y += 15
      doc.fontSize(12).fillColor(slate900).text("Payment History", 50, y)

      y += 15
      doc.fontSize(10).fillColor(slate600).text("Date", 50, y)
      doc.text("Amount", rightX - 60, y, { width: 60, align: "right" })

      y += 15
      doc
        .strokeColor(slate300)
        .moveTo(50, y - 5)
        .lineTo(rightX, y - 5)
        .stroke()

      sale.payments.forEach((payment: any) => {
        const paymentDate =
          typeof payment.date === "string"
            ? new Date(payment.date).toLocaleDateString()
            : new Date(payment.date.seconds * 1000).toLocaleDateString()

        doc.fillColor(slate600).text(paymentDate, 50, y)
        doc.fillColor(slate900).text(`£${payment.amount.toFixed(2)}`, rightX - 60, y, { width: 60, align: "right" })

        y += 15
        doc
          .strokeColor(slate300)
          .moveTo(50, y - 5)
          .lineTo(rightX, y - 5)
          .stroke()
      })
    }

    // Footer
    y += 25
    doc.strokeColor(slate300).moveTo(50, y).lineTo(rightX, y).stroke()

    y += 15
    doc.fontSize(9).fillColor(slate600).text("Thank you for your business!", 0, y, { align: "center" })

    y += 12
    doc.text("For questions about this invoice, please contact us at 07838040902", 0, y, { align: "center" })

    doc.end()
    const buffer = await done

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${sale.invoiceNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    console.error("PDF generation failed:", err)
    return new Response("Server error", { status: 500 })
  }
}
