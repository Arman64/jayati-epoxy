import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { STATUS_LABEL, allLeadsForExport } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Escape CSV. Awalan tanda kutip tunggal pada =,+,-,@ mencegah formula
 * injection saat file dibuka di Excel / Google Sheets.
 */
function cell(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const leads = await allLeadsForExport();

  const header = [
    'ID',
    'Nama',
    'Telepon',
    'Kota',
    'Jenis bangunan',
    'Luas (m2)',
    'Kondisi lantai',
    'Kebutuhan',
    'Pesan',
    'Sumber',
    'Status',
    'Petugas',
    'Estimasi nilai',
    'Follow-up',
    'Masuk',
  ];

  const lines = [header.map(cell).join(',')];
  for (const l of leads) {
    lines.push(
      [
        l.id,
        l.name,
        l.phone,
        l.city,
        l.buildingType,
        l.areaSqm,
        l.floorCondition,
        l.needType,
        l.message,
        l.source,
        STATUS_LABEL[l.status],
        l.assignedName,
        l.estimatedValue,
        l.followUpAt,
        new Date(l.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      ]
        .map(cell)
        .join(','),
    );
  }

  // BOM agar Excel membaca UTF-8 dengan benar.
  const csv = '\uFEFF' + lines.join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="prospek-jayati-${stamp}.csv"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
