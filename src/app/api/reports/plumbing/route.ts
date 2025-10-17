import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}))
    const buffer = await generatePlumbingPDF(payload)
    const name = (payload?.project?.name || 'vibelux_plumbing').replace(/[^a-z0-9]/gi, '_')
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}.pdf"`
      }
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate plumbing PDF' }, { status: 500 })
  }
}

async function generatePlumbingPDF(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Branded header
    try {
      const logoPath = path.join(process.cwd(), 'public', 'vibelux-logo.png')
      if (fs.existsSync(logoPath)) {
        doc.rect(50, 40, doc.page.width - 100, 30).fill('#0f172a')
        doc.image(logoPath, 60, 45, { height: 20 })
        doc.fillColor('#e5e7eb').fontSize(12).text('MEP | Plumbing Report', 0, 50, { align: 'right', width: doc.page.width - 100 })
        doc.moveDown(2)
      }
    } catch {}

    // Title
    doc.fillColor('#111827').fontSize(18).text('Plumbing Fixture Units & Service Flow', { align: 'center' })
    doc.moveDown(0.25)
    doc.fontSize(10).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(0.75)

    // Inputs and Results
    const p = data?.plumbing || {}
    const rows: Array<[string, string]> = [
      ['Cold Fixture Units', String(p.coldFu ?? 'N/A')],
      ['Hot Fixture Units', String(p.hotFu ?? 'N/A')],
      ['Total Fixture Units', String(p.totalFu ?? 'N/A')],
      ['Estimated Service Flow (gpm)', String(p.serviceGpm ?? 'N/A')],
    ]
    doc.fontSize(12).fillColor('#111827').text('Summary', { underline: true })
    doc.moveDown(0.5)
    drawTable(doc, ['Metric', 'Value'], rows)

    // Title block footer
    drawTitleBlock(doc, data)

    doc.end()
  })
}

function drawTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][]) {
  const startX = 50
  let y = doc.y
  const colWidths = [250, 250]

  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10)
  let x = startX
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y, { width: colWidths[i] - 8 })
    x += colWidths[i]
  })
  y += 18
  doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke('#D1D5DB')
  y += 6

  doc.font('Helvetica').fillColor('#111827').fontSize(9)
  rows.forEach((row) => {
    x = startX
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), x + 4, y, { width: colWidths[i] - 8 })
      x += colWidths[i]
    })
    y += 16
  })
  doc.moveDown(1)
}

function drawTitleBlock(doc: PDFKit.PDFDocument, report: any) {
  const margin = 40
  const blockHeight = 90
  const y = doc.page.height - blockHeight - margin
  const x = margin
  const w = doc.page.width - margin * 2

  doc.save()
  doc.roundedRect(x, y, w, blockHeight, 6).stroke('#9CA3AF')

  try {
    const logoPath = path.join(process.cwd(), 'public', 'vibelux-logo.png')
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, x + 10, y + 10, { height: 24 })
    }
  } catch {}
  doc.fillColor('#111827').fontSize(10).text('Vibelux Professional MEP Suite', x + 10, y + 40)
  doc.fillColor('#6B7280').fontSize(8).text('www.vibelux.com', x + 10, y + 56)

  const infoX = x + 200
  const line = (label: string, value: string, rowIndex: number) => {
    const rowY = y + 12 + rowIndex * 16
    doc.fillColor('#6B7280').fontSize(8).text(label, infoX, rowY)
    doc.fillColor('#111827').fontSize(9).text(value || '—', infoX + 120, rowY)
  }
  const proj = report?.project || {}
  line('Project Name', String(proj.name || 'Untitled'), 0)
  line('Prepared By', String(proj.preparedBy || 'Vibelux Designer'), 1)
  line('Discipline', 'Plumbing', 2)
  line('Date', String(proj.date || new Date().toLocaleDateString()), 3)

  doc.restore()
}


