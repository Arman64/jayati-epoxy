import Link from 'next/link';

export const metadata = { title: 'Halaman Tidak Ditemukan', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl font-extrabold text-leaf-500">404</p>
      <h1 className="mt-4 text-3xl">Halaman tidak ditemukan</h1>
      <p className="prose-brand mx-auto mt-3 max-w-md">
        Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
        <Link href="/kontak" className="btn-outline">Hubungi Kami</Link>
      </div>
    </div>
  );
}
