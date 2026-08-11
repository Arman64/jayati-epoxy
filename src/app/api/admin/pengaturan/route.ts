import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { defaultSettings, saveSettingGroup, type AllSettings } from '@/lib/settings';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GROUPS = ['company', 'contact', 'social', 'cta', 'seo'] as const;

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner') {
    return NextResponse.json(
      { ok: false, error: 'Hanya pemilik yang dapat mengubah pengaturan.' },
      { status: 403 },
    );
  }

  let body: { group?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const group = String(body.group ?? '');
  if (!(GROUPS as readonly string[]).includes(group)) {
    return NextResponse.json({ ok: false, error: 'Grup pengaturan tidak dikenal.' }, { status: 422 });
  }
  if (!body.value || typeof body.value !== 'object' || Array.isArray(body.value)) {
    return NextResponse.json({ ok: false, error: 'Nilai pengaturan tidak valid.' }, { status: 422 });
  }

  // Hanya terima kunci yang memang ada di grup tersebut.
  const allowed = Object.keys(defaultSettings()[group as keyof AllSettings]);
  const incoming = body.value as Record<string, unknown>;
  const clean: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in incoming) clean[key] = incoming[key];
  }

  // Validasi ringan untuk kolom yang berdampak besar.
  if (group === 'seo' && typeof clean.siteUrl === 'string') {
    const u = clean.siteUrl.trim().replace(/\/+$/, '');
    if (u && !/^https?:\/\/[^\s/]+$/.test(u)) {
      return NextResponse.json(
        { ok: false, error: 'URL situs harus berupa alamat lengkap, contoh https://jayatiepoxy.id' },
        { status: 422 },
      );
    }
    clean.siteUrl = u;
  }
  if (group === 'contact') {
    for (const f of ['phoneE164', 'whatsappE164'] as const) {
      const v = clean[f];
      if (typeof v === 'string' && v.trim() && !/^\+?\d{8,16}$/.test(v.trim())) {
        return NextResponse.json(
          { ok: false, error: `Nomor "${f}" harus berupa angka, contoh +6285785822695.` },
          { status: 422 },
        );
      }
    }
    if (typeof clean.email === 'string' && clean.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
      return NextResponse.json({ ok: false, error: 'Format email tidak valid.' }, { status: 422 });
    }
  }
  if (group === 'cta' && typeof clean.floatingDelayMs === 'number') {
    clean.floatingDelayMs = Math.min(Math.max(clean.floatingDelayMs, 0), 15000);
  }

  try {
    await saveSettingGroup(group as keyof AllSettings, clean, user.id);
    await logCmsEvent('settings', group, 'update', { keys: Object.keys(clean) }, 'admin', user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/pengaturan PUT]', err);
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan pengaturan.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
