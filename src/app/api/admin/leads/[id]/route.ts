import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { LEAD_STATUSES, deleteLead, updateLead, type LeadStatus } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }
  const id = Number(params.id);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const changes: {
    status?: LeadStatus;
    assignedTo?: number | null;
    estimatedValue?: number | null;
    followUpAt?: string | null;
  } = {};

  if ('status' in body) {
    const s = body.status;
    if (typeof s !== 'string' || !(LEAD_STATUSES as readonly string[]).includes(s)) {
      return NextResponse.json({ ok: false, error: 'Status tidak dikenal.' }, { status: 422 });
    }
    changes.status = s as LeadStatus;
  }

  if ('assignedTo' in body) {
    const a = body.assignedTo;
    if (a === null) changes.assignedTo = null;
    else if (typeof a === 'number' && Number.isInteger(a) && a > 0) changes.assignedTo = a;
    else return NextResponse.json({ ok: false, error: 'Petugas tidak valid.' }, { status: 422 });
  }

  if ('estimatedValue' in body) {
    const v = body.estimatedValue;
    if (v === null) changes.estimatedValue = null;
    else if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e12)
      changes.estimatedValue = v;
    else return NextResponse.json({ ok: false, error: 'Nilai proyek tidak valid.' }, { status: 422 });
  }

  if ('followUpAt' in body) {
    const d = body.followUpAt;
    if (d === null || d === '') changes.followUpAt = null;
    else if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) changes.followUpAt = d;
    else return NextResponse.json({ ok: false, error: 'Tanggal tidak valid.' }, { status: 422 });
  }

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ ok: false, error: 'Tidak ada perubahan.' }, { status: 422 });
  }

  try {
    const lead = await updateLead(id, user.id, changes);
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Prospek tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    console.error('[admin/leads PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== 'owner') {
    return NextResponse.json(
      { ok: false, error: 'Hanya pemilik yang dapat menghapus prospek.' },
      { status: 403 },
    );
  }
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }

  const done = await deleteLead(Number(params.id));
  if (!done) {
    return NextResponse.json({ ok: false, error: 'Prospek tidak ditemukan.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
