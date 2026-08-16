import { NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Domain yang diizinkan untuk submit form — CSRF protection (M-01)
const ALLOWED_ORIGINS = [
  'https://jayatiepoxy.id',
  'https://www.jayatiepoxy.id',
  'https://jayati-epoxy.vercel.app',
  // Preview deployments Vercel: https://jayati-epoxy-git-*.vercel.app
];

/** Periksa apakah origin diizinkan (termasuk preview deployment Vercel). */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false; // Tolak jika tidak ada Origin header
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Izinkan semua Vercel preview deployments dari repo yang sama
  if (/^https:\/\/jayati-epoxy(-git-[a-z0-9-]+)?-[a-z0-9]+\.vercel\.app$/.test(origin)) return true;
  // Izinkan localhost untuk development
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

/** Rate limit sederhana in-memory. Produksi: pindah ke Redis/Upstash — PRD §7 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

// Cleanup entry yang sudah expired setiap 15 menit untuk mencegah memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}, 15 * 60 * 1000);

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function clean(v: FormDataEntryValue | null, max = 500): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  // CSRF protection: periksa Origin header — M-01
  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { ok: false, error: 'Permintaan ditolak.' },
      { status: 403 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.' },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  // Honeypot: bot mengisi field tersembunyi → respons sukses palsu agar bot tidak retry.
  if (clean(form.get('company_website'))) {
    return NextResponse.json({ ok: true, id: 'ok' }, { status: 200 });
  }

  const name = clean(form.get('name'), 120);
  const phone = clean(form.get('phone'), 25);
  const city = clean(form.get('city'), 120);
  const buildingType = clean(form.get('buildingType'), 80);
  const areaSqmRaw = clean(form.get('areaSqm'), 12);
  const floorCondition = clean(form.get('floorCondition'), 80);
  const needType = clean(form.get('needType'), 80);
  const message = clean(form.get('message'), 2000);
  const source = clean(form.get('source'), 60) || 'website';

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = 'Nama minimal 2 karakter.';
  if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) fields.phone = 'Nomor WhatsApp tidak valid.';
  if (city.length < 2) fields.city = 'Kota wajib diisi.';

  const areaSqm = areaSqmRaw ? Number(areaSqmRaw) : null;
  if (areaSqm !== null && (!Number.isFinite(areaSqm) || areaSqm <= 0 || areaSqm > 1_000_000)) {
    fields.areaSqm = 'Luas area tidak valid.';
  }

  // Validasi file: MIME, ukuran, ekstensi — PRD §15
  const photo = form.get('photo');
  let photoMeta: { name: string; size: number; type: string } | null = null;
  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_MIME.includes(photo.type) || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      fields.photo = 'Format file harus JPG, PNG, atau WebP.';
    } else if (photo.size > MAX_FILE_BYTES) {
      fields.photo = 'Ukuran file maksimal 5 MB.';
    } else {
      photoMeta = { name: photo.name.slice(0, 180), size: photo.size, type: photo.type };
    }
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json(
      { ok: false, error: 'Data belum lengkap atau tidak valid.', fields },
      { status: 422 },
    );
  }

  let lead: { id: string };
  try {
    lead = await saveLead({
      name,
      phone,
      city,
      buildingType,
      areaSqm,
      floorCondition,
      needType,
      message,
      source,
      photoPath: photoMeta ? photoMeta.name : null,
      ip,
      userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? '',
    });
  } catch (err) {
    // Jangan pernah menelan lead tanpa jejak: catat di log server.
    console.error('[leads] gagal menyimpan ke database:', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Sistem sedang bermasalah menyimpan data Anda. Silakan hubungi kami langsung via WhatsApp.',
      },
      { status: 503 },
    );
  }

  // Auto-reply sopan tanpa menjanjikan harga final — PRD §7
  return NextResponse.json(
    {
      ok: true,
      id: lead.id,
      autoReply:
        'Terima kasih. Permintaan Anda tercatat dan akan ditindaklanjuti pada jam kerja. Estimasi final diberikan setelah kondisi lantai diperiksa.',
    },
    { status: 201 },
  );
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
