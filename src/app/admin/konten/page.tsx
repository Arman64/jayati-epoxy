import { redirect } from 'next/navigation';

/**
 * Menu "Konten" sudah dilebur ke dalam Halaman → tab "Dipakai bersama",
 * supaya pengaturan halaman dan isinya tidak lagi terpisah. Rute lama
 * dipertahankan agar tautan dan penanda buku yang sudah ada tetap jalan.
 */
export const dynamic = 'force-dynamic';

export default function KontenRedirect({ searchParams }: { searchParams: { c?: string } }) {
  const c = searchParams.c ? `&c=${encodeURIComponent(searchParams.c)}` : '';
  redirect(`/admin/halaman?tab=bersama${c}`);
}
