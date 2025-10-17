'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

type Sheet = { id: string; name: string; discipline: 'A' | 'M' | 'E' | 'P'; title: string }

export default function SheetManagerPage() {
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: 'A-001', name: 'Cover', discipline: 'A', title: 'Cover Sheet' },
    { id: 'A-101', name: 'Floor Plan', discipline: 'A', title: 'Overall Floor Plan' },
    { id: 'M-201', name: 'Mechanical Plan', discipline: 'M', title: 'HVAC/LV Layout' },
    { id: 'E-301', name: 'One-Line', discipline: 'E', title: 'Electrical One-Line' },
    { id: 'P-401', name: 'Plumbing Plan', discipline: 'P', title: 'Domestic Water/Sanitary' },
  ])

  const exportSheetsCSV = () => exportToCSV(sheets as any[], 'sheet_index.csv')
  const exportPDF = () => {
    const html = `
      <h1>Sheet Index</h1>
      <table><thead><tr><th>ID</th><th>Name</th><th>Discipline</th><th>Title</th></tr></thead>
      <tbody>
      ${sheets.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.discipline}</td><td>${s.title}</td></tr>`).join('')}
      </tbody></table>
    `
    exportToPDF(html, 'sheet_index.pdf')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Sheet Manager (MVP)</h1>
        <HowItWorksStrip
          dense
          heading="How sheet manager works"
          subheading="Create a sheet index for A/M/E/P and export to CSV/PDF for drawing sets."
          steps={[
            { title: 'Add sheets', description: 'IDs, names, disciplines, titles', href: '#', ctaLabel: 'Add' },
            { title: 'Organize', description: 'Order and group sheets by discipline', href: '#', ctaLabel: 'Arrange' },
            { title: 'Export index', description: 'CSV and PDF index pages', href: '#', ctaLabel: 'Export' },
            { title: 'Include in set', description: 'Attach to drawing package', href: '/export-center', ctaLabel: 'Package' },
          ]}
        />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button onClick={exportSheetsCSV} variant="outline">Export CSV</Button>
              <Button onClick={exportPDF}>Export PDF</Button>
            </div>
            {sheets.map(s => (
              <div key={s.id} className="grid md:grid-cols-4 gap-3 p-3 bg-gray-800 rounded">
                <div>{s.id}</div>
                <div>{s.name}</div>
                <div>{s.discipline}</div>
                <div>{s.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

