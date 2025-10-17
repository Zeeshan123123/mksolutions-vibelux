import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'
 

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId') || undefined;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = {};
  if (facilityId) where.facilityId = facilityId;
  if (from || to) {
    where.timestamp = {} as any;
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }

  const records = await prisma.scoutingRecord.findMany({
    where,
    orderBy: { timestamp: 'desc' }
  });

  const sections = [
    {
      title: 'Summary',
      content: [
        { type: 'text', value: `Reports: ${records.length}` },
        { type: 'text', value: `Period: ${from || 'start'} to ${to || 'now'}` },
      ],
    },
    {
      title: 'Findings',
      content: [
        {
          type: 'table',
          headers: ['Date', 'Type', 'Severity', 'Zone', 'Photos', 'Notes'],
          rows: records.slice(0, 200).map(r => [
            r.timestamp.toLocaleString(),
            r.issueType,
            r.severity,
            r.zone || '',
            String((r.photos || []).length),
            (r.notes || '').replace(/\n/g, ' ').slice(0, 100),
          ]),
        },
      ],
    },
  ] as any;

  // Use server-only PDF generation. Ensure pdfkit is bundled correctly for server.
  // Import PDF generator at runtime to avoid bundling issues during build
  const { PDFReportGenerator } = await import('@/lib/reports/pdf-generator');
  const generator = new PDFReportGenerator({ title: 'Vibelux IPM Scouting Report', headerColor: '#7C3AED' });
  const buffer = await generator.generateBuffer(sections);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="scouting-report-${Date.now()}.pdf"`,
    },
  });
}


