import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Penyaji gambar unggahan.
 *
 * Next.js hanya mendaftarkan isi `public/` saat server dinyalakan, jadi foto
 * yang baru diunggah akan 404 sampai server di-restart. Rute ini membaca
 * berkasnya langsung dari disk sehingga foto langsung tampil begitu diunggah.
 *
 * Berkas sudah dalam format AVIF hasil konversi saat unggah, jadi tidak perlu
 * diproses lagi di sini — cukup dikirim apa adanya dengan cache panjang
 * (nama berkas selalu unik, jadi aman di-cache selamanya).
 */

const DIR = path.join(process.cwd(), 'public', 'img', 'unggahan');

const MIME: Record<string, string> = {
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const segments = params.path ?? [];

  // Hanya satu segmen nama berkas yang diizinkan. Menolak sub-folder sekaligus
  // menutup celah path traversal (`..`, garis miring, byte nol).
  if (segments.length !== 1) return new Response('Not found', { status: 404 });

  const name = segments[0]!;
  if (!/^[a-z0-9][a-z0-9-]*\.(avif|webp|jpe?g|png)$/i.test(name)) {
    return new Response('Not found', { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  const full = path.join(DIR, name);

  // Sabuk pengaman kedua: pastikan hasil resolve benar-benar di dalam DIR.
  if (path.dirname(path.resolve(full)) !== path.resolve(DIR)) {
    return new Response('Not found', { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readFile(full);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Content-Length': String(data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
