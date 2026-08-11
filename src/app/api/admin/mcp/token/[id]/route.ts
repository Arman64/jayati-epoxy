import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { logCmsEvent, revokeToken } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_r: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mencabut token.' }, { status: 403 });
  }
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }

  const done = await revokeToken(Number(params.id));
  if (!done) return NextResponse.json({ ok: false, error: 'Token tidak ditemukan.' }, { status: 404 });
  await logCmsEvent('mcp_token', params.id, 'revoke', {}, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
