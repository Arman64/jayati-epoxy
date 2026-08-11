import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createToken, logCmsEvent, type Scope } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID: Scope[] = ['read', 'write', 'publish'];

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat membuat token.' }, { status: 403 });
  }

  let body: { name?: unknown; scopes?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  if (name.length < 3 || name.length > 80) {
    return NextResponse.json({ ok: false, error: 'Nama token 3–80 karakter.' }, { status: 422 });
  }

  const raw = Array.isArray(body.scopes) ? body.scopes.map(String) : [];
  const scopes = VALID.filter((s) => raw.includes(s));
  if (scopes.length === 0) {
    return NextResponse.json({ ok: false, error: 'Pilih minimal satu hak akses.' }, { status: 422 });
  }

  try {
    const { token, row } = await createToken(name, scopes, user.id);
    await logCmsEvent('mcp_token', row.id, 'create', { name, scopes }, 'admin', user.id);
    return NextResponse.json({ ok: true, token, id: row.id }, { status: 201 });
  } catch (err) {
    console.error('[admin/mcp/token POST]', err);
    return NextResponse.json({ ok: false, error: 'Gagal membuat token.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
