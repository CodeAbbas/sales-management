import "server-only"
import PDFDocument from "pdfkit"
import type { NextRequest } from "next/server"

// Ensure Node.js runtime (PDFKit won't work on Edge runtime)
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type Sale = {
  invoiceNumber: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: { name: string; price: number; quantity: number }[]
  payments: { amount: number; date: string | { seconds: number; nanoseconds: number } }[]
  total: number
  amountDue: number
}

function formatDate(d: string | { seconds: number; nanoseconds: number }) {
  if (typeof d === "string") return new Date(d)
  // Firestore Timestamp-like
  return new Date(d.seconds * 1000 + Math.floor(d.nanoseconds / 1e6))
}

export async function POST(req: NextRequest) {
  const sale = (await req.json()) as Sale

  // Build PDF into a Buffer (simplest + most compatible with Route Handlers)
  const doc = new PDFDocument({ size: "A4", margin: 40 })
  const chunks: Buffer[] = []
  doc.on("data", (c) => chunks.push(c))

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  })

  // ====== Styles / helpers ======
  const emerald = "#10b981"
  const slate900 = "#0f172a"
  const slate600 = "#64748b"
  const slate300 = "#cbd5e1"
  const green = "#22c55e"
  const red = "#ef4444"
  const pageWidth = doc.page.width
  const rightX = pageWidth - doc.page.margins.right

  doc.registerFont("Sans", "Helvetica")
  doc.registerFont("Sans-Bold", "Helvetica-Bold")

  // ====== Header Left ======
  let y = 40
  doc.font("Sans-Bold").fontSize(24).fillColor(emerald).text("Selection Furniture", 40, y)
  y += 12
  doc.font("Sans").fontSize(10).fillColor(slate600)
  doc.text("72 Queen's Market, Upton park", 40, y)
  y += 14
  doc.text("E13 9BA", 40, y)
  y += 14
  doc.text("Phone: 07838040902", 40, y)
  y += 14
  doc.text("Email: ", 40, y)

  // ====== Header Right ======
  doc.font("Sans-Bold").fontSize(20).fillColor(slate900).text("INVOICE", 0, 40, { align: "right" })
  doc
    .font("Sans")
    .fontSize(10)
    .fillColor(slate600)
    .text(`Invoice #: ${sale.invoiceNumber}`, { align: "right" })
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })

  // ====== Bill To ======
  y = 120
  doc.font("Sans-Bold").fontSize(12).fillColor(slate900).text("Bill To:", 40, y)
  y += 18
  doc.font("Sans-Bold").fontSize(10).fillColor(slate900).text(sale.customerName, 40, y)
  y += 14
  doc.font("Sans").fillColor(slate600).text(sale.customerPhone, 40, y)
  y += 14
  if (sale.customerAddress) {
    sale.customerAddress.split("\n").forEach((line) => {
      doc.text(line, 40, y)
      y += 12
    })
  }

  // ====== Items Table ======
  y += 16
  const tableTop = y
  const colX = [40, 120, pageWidth - 180, pageWidth - 80] // qty, name, unit, total
  const rowHeight = 22

  // Head
  doc
    .strokeColor(slate300)
    .lineWidth(1)
    .moveTo(40, tableTop - 6)
    .lineTo(rightX, tableTop - 6)
    .stroke()
  doc.font("Sans-Bold").fontSize(10).fillColor(slate900)
  doc.text("Quantity", colX[0], tableTop)
  doc.text("Item Name", colX[1], tableTop)
  doc.text("Unit Price", colX[2], tableTop, { width: 80, align: "right" })
  doc.text("Total", colX[3], tableTop, { width: 60, align: "right" })
  y += rowHeight
  doc
    .strokeColor(slate300)
    .moveTo(40, y - 6)
    .lineTo(rightX, y - 6)
    .stroke()

  // Body
  doc.font("Sans").fillColor(slate600).fontSize(10)
  sale.items.forEach((item) => {
    doc.text(String(item.quantity), colX[0], y)
    doc.fillColor(slate900).text(item.name, colX[1], y, { width: colX[2] - colX[1] - 10 })
    doc.fillColor(slate600).text(`$${item.price.toFixed(2)}`, colX[2], y, { width: 80, align: "right" })
    doc
      .fillColor(slate900)
      .font("Sans-Bold")
      .text(`$${(item.price * item.quantity).toFixed(2)}`, colX[3], y, { width: 60, align: "right" })
    doc.font("Sans").fillColor(slate600)
    y += rowHeight
    doc
      .strokeColor(slate300)
      .moveTo(40, y - 6)
      .lineTo(rightX, y - 6)
      .stroke()
  })

  // ====== Summary ======
  y += 16
  const summaryX = pageWidth - 180
  const line = (label: string, value: string, bold = false) => {
    doc.font("Sans").fillColor(slate600).fontSize(10).text(label, summaryX, y)
    doc
      .font(bold ? "Sans-Bold" : "Sans")
      .fillColor(slate900)
      .text(value, rightX, y, { align: "right" })
    y += 16
  }

  const totalPayments = sale.payments.reduce((s, p) => s + p.amount, 0)
  line("Subtotal:", `$${sale.total.toFixed(2)}`)
  doc
    .strokeColor(slate300)
    .moveTo(summaryX, y - 6)
    .lineTo(rightX, y - 6)
    .stroke()
  line("Total Payments:", `$${totalPayments.toFixed(2)}`)
  doc
    .lineWidth(2)
    .strokeColor(slate300)
    .moveTo(summaryX, y - 6)
    .lineTo(rightX, y - 6)
    .stroke()
  doc.font("Sans-Bold").fontSize(12).fillColor(slate900).text("Amount Due:", summaryX, y)
  doc.fillColor(sale.amountDue === 0 ? green : red).text(`$${sale.amountDue.toFixed(2)}`, rightX, y, { align: "right" })
  y += 28

  // ====== Paid stamp ======
  if (sale.amountDue === 0) {
    doc.font("Sans-Bold").fontSize(16).fillColor(green).text("PAID IN FULL", 0, y, { align: "center" })
    y += 24
  }

  // ====== Payment History ======
  if (sale.payments.length > 0) {
    y += 10
    doc.strokeColor(slate300).moveTo(40, y).lineTo(rightX, y).stroke()
    y += 14
    doc.font("Sans-Bold").fontSize(12).fillColor(slate900).text("Payment History", 40, y)
    y += 18
    doc.font("Sans-Bold").fontSize(10).fillColor(slate900).text("Date", 40, y)
    doc.text("Amount", rightX - 60, y, { width: 60, align: "right" })
    y += rowHeight
    doc
      .strokeColor(slate300)
      .moveTo(40, y - 6)
      .lineTo(rightX, y - 6)
      .stroke()
    doc.font("Sans").fillColor(slate600).fontSize(10)
    sale.payments.forEach((p) => {
      doc.text(formatDate(p.date).toLocaleDateString(), 40, y)
      doc
        .fillColor(slate900)
        .font("Sans-Bold")
        .text(`$${p.amount.toFixed(2)}`, rightX - 60, y, { width: 60, align: "right" })
      doc.font("Sans").fillColor(slate600)
      y += rowHeight
      doc
        .strokeColor(slate300)
        .moveTo(40, y - 6)
        .lineTo(rightX, y - 6)
        .stroke()
    })
    y += 8
  }

  // ====== Footer ======
  y += 20
  doc.strokeColor(slate300).moveTo(40, y).lineTo(rightX, y).stroke()
  y += 10
  doc.font("Sans").fontSize(9).fillColor(slate600).text("Thank you for your business!", 0, y, { align: "center" })
  y += 12
  doc.text("For questions about this invoice, please contact us at 07838040902", { align: "center" })

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
}
