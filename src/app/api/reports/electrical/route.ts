import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const report = await req.json()

    const buffer = await generateElectricalPDF(report)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(report?.project?.name || 'vibelux_electrical').replace(/[^a-z0-9]/gi, '_')}.pdf"`
      }
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

async function generateElectricalPDF(report: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Branded header with logo bar
    try {
      const logoPathPng = path.join(process.cwd(), 'public', 'vibelux-logo.png')
      if (fs.existsSync(logoPathPng)) {
        doc.rect(50, 40, doc.page.width - 100, 30).fill('#0f172a')
        doc.image(logoPathPng, 60, 45, { height: 20 })
        doc.fillColor('#e5e7eb').fontSize(12).text('MEP | Electrical Report', 0, 50, { align: 'right', width: doc.page.width - 100 })
        doc.moveDown(2)
      }
    } catch {}

    // Report title and timestamp
    doc.fillColor('#111827').fontSize(18).text('Electrical Estimate & Panel Schedule', { align: 'center' })
    doc.moveDown(0.25)
    doc.fontSize(10).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(0.75)

    // Project Info
    const p = report?.project || {}
    doc.fontSize(12).fillColor('#111827').text('Project Information', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#111827')
    const left = 50
    const right = 320
    doc.text(`Name: ${p.name || 'N/A'}`, left)
    doc.text(`Number: ${p.number || 'N/A'}`, right)
    doc.text(`Location: ${p.location || 'N/A'}`, left)
    doc.text(`Date: ${p.date || 'N/A'}`, right)
    doc.text(`Prepared by: ${p.preparedBy || 'N/A'}`, left)
    doc.text(`Checked by: ${p.checkedBy || 'N/A'}`, right)
    doc.moveDown(1)

    // Summary
    const s = report?.summary || {}
    doc.fontSize(12).text('Summary', { underline: true })
    doc.moveDown(0.5)
    const summaryRows: Array<[string, string]> = [
      ['Total Fixtures', String(s.totalFixtures ?? 'N/A')],
      ['Total Load (W)', String(s.totalWattage ?? 'N/A')],
      ['Required Circuits', String(s.requiredCircuits ?? 'N/A')],
      ['Panel Size (A)', String(s.panelSize ?? 'N/A')],
      ['Voltage Drop (%)', typeof s.voltageDrop === 'number' ? s.voltageDrop.toFixed(2) : 'N/A'],
      ['Estimated Cost ($)', s.estimatedCost ? Number(s.estimatedCost).toLocaleString() : 'N/A']
    ]
    drawTable(doc, ['Metric', 'Value'], summaryRows)
    doc.moveDown(1)

    // Circuit Schedule
    if (report?.circuitSchedule?.length) {
      doc.addPage()
      doc.fontSize(12).fillColor('#111827').text('Circuit Schedule', { underline: true })
      doc.moveDown(0.5)
      const circuitRows = report.circuitSchedule.map((c: any) => [
        String(c.circuit), c.description, String(c.phase), String(c.breaker), String(c.wire), String(c.load), c.fixtures || ''
      ])
      drawTable(doc, ['Circuit', 'Description', 'Phase', 'Breaker', 'Wire', 'Load (W)', 'Fixtures'], circuitRows, { colWidths: [55, 130, 45, 60, 55, 55, 160] })
    }

    // Panel Schedule (derived)
    if (report?.panelLocations?.length) {
      const panel = report.panelLocations[0]
      doc.addPage()
      doc.fontSize(12).fillColor('#111827').text(`Panel Schedule - ${panel.name}`, { underline: true })
      doc.moveDown(0.5)
      const perCircuit = report?.circuitSchedule || []
      const panelRows = perCircuit.map((c: any, idx: number) => [
        String(idx + 1), `C-${idx + 1}`, c.phase || '-', c.breaker || '-', c.fixtures || ''
      ])
      drawTable(doc, ['Space', 'Circuit', 'Phase', 'Breaker', 'Connected Loads'], panelRows, { colWidths: [55, 70, 70, 70, 230] })
    }

    // One-Line Diagram (simple)
    if (report?.panelLocations?.length) {
      doc.addPage()
      doc.fontSize(12).fillColor('#111827').text('Single Line Diagram (Simplified)', { underline: true })
      doc.moveDown(1)
      const startX = 80
      const startY = doc.y + 20
      const panelX = startX + 200
      const panelY = startY + 60

      // Service box
      doc.rect(startX, startY, 120, 50).stroke('#374151')
      doc.fontSize(10).fillColor('#111827').text('Service Entrance', startX + 8, startY + 18)
      // Line to panel
      doc.moveTo(startX + 120, startY + 25).lineTo(panelX, panelY + 25).stroke('#9CA3AF')
      // Panel box
      doc.rect(panelX, panelY, 140, 50).stroke('#374151')
      doc.fontSize(10).fillColor('#111827').text(report.panelLocations[0].name || 'Panel', panelX + 8, panelY + 18)

      // Branch circuits
      const circuits = Math.min(12, (report?.circuitSchedule?.length || 0))
      for (let i = 0; i < circuits; i++) {
        const cy = panelY + 25 + (i - circuits / 2) * 18
        doc.moveTo(panelX + 140, panelY + 25).lineTo(panelX + 200, cy).stroke('#9CA3AF')
        doc.circle(panelX + 205, cy, 3).fill('#4B5563')
        doc.fillColor('#111827').fontSize(8).text(`C-${i + 1}`, panelX + 212, cy - 4)
      }
    }

    // Materials and Labor
    doc.addPage()
    doc.fontSize(12).fillColor('#111827').text('Materials & Labor', { underline: true })
    doc.moveDown(0.5)
    if (report?.materialList) {
      const materialRows = Object.values(report.materialList).map((m: any) => [
        m.description, String(m.quantity), m.unit, `$${Number(m.unitPrice).toFixed(2)}`, `$${Number(m.totalPrice).toFixed(2)}`
      ])
      drawTable(doc, ['Description', 'Qty', 'Unit', 'Unit Price', 'Total'], materialRows, { colWidths: [250, 55, 55, 80, 90] })
      doc.moveDown(1)
    }
    if (report?.laborBreakdown) {
      const laborRows = Object.values(report.laborBreakdown).map((l: any) => [
        l.description, `${l.hours.toFixed(1)} h`, `$${Number(l.rate).toFixed(2)}/hr`, `$${Number(l.total).toFixed(2)}`
      ])
      drawTable(doc, ['Task', 'Hours', 'Rate', 'Total'], laborRows, { colWidths: [260, 80, 80, 110] })
    }

    // Branded title block footer (first page style) on last page
    drawTitleBlock(doc, report)

    doc.end()
  })
}

function drawTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  options?: { colWidths?: number[] }
) {
  const startX = 50
  let y = doc.y
  const colWidths = options?.colWidths || Array(headers.length).fill((doc.page.width - 100) / headers.length)

  // Header
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10)
  let x = startX
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y, { width: colWidths[i] - 8 })
    x += colWidths[i]
  })
  y += 18
  doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke('#D1D5DB')
  y += 6

  // Rows
  doc.font('Helvetica').fillColor('#111827').fontSize(9)
  rows.forEach((row) => {
    x = startX
    let rowHeight = 14
    row.forEach((cell, i) => {
      const text = String(cell ?? '')
      doc.text(text, x + 4, y, { width: colWidths[i] - 8 })
      x += colWidths[i]
    })
    y += rowHeight
    if (y > doc.page.height - 100) {
      doc.addPage()
      y = doc.y
      x = startX
      // re-draw header on new page
      doc.font('Helvetica-Bold').fontSize(10)
      headers.forEach((h, i) => {
        doc.text(h, x + 4, y, { width: colWidths[i] - 8 })
        x += colWidths[i]
      })
      y += 18
      doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke('#D1D5DB')
      y += 6
      doc.font('Helvetica').fontSize(9)
    }
  })
  doc.moveDown(1)
}

function drawTitleBlock(doc: PDFKit.PDFDocument, report: any) {
  const margin = 40
  const blockHeight = 90
  const y = doc.page.height - blockHeight - margin
  const x = margin
  const w = doc.page.width - margin * 2

  // Border
  doc.save()
  doc.roundedRect(x, y, w, blockHeight, 6).stroke('#9CA3AF')

  // Left: Vibelux branding
  try {
    const logoPathPng = path.join(process.cwd(), 'public', 'vibelux-logo.png')
    if (fs.existsSync(logoPathPng)) {
      doc.image(logoPathPng, x + 10, y + 10, { height: 24 })
    }
  } catch {}
  doc.fillColor('#111827').fontSize(10).text('Vibelux Professional MEP Suite', x + 10, y + 40)
  doc.fillColor('#6B7280').fontSize(8).text('www.vibelux.com', x + 10, y + 56)

  // Right: Project metadata grid
  const infoX = x + 200
  const line = (label: string, value: string, rowIndex: number) => {
    const rowY = y + 12 + rowIndex * 16
    doc.fillColor('#6B7280').fontSize(8).text(label, infoX, rowY)
    doc.fillColor('#111827').fontSize(9).text(value || '—', infoX + 120, rowY)
  }
  const p = report?.project || {}
  line('Project Name', String(p.name || 'Untitled'), 0)
  line('Project Number', String(p.number || '—'), 1)
  line('Prepared By', String(p.preparedBy || 'Vibelux Designer'), 2)
  line('Checked By', String(p.checkedBy || '—'), 3)
  line('Date', String(p.date || new Date().toLocaleDateString()), 4)

  // Disclaimer
  doc.fillColor('#6B7280').fontSize(8).text(
    'All electrical work to be performed by licensed electricians. Verify local codes and AHJ requirements.',
    x + 10,
    y + blockHeight - 18,
    { width: w - 20, align: 'right' }
  )
  doc.restore()
}


