import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { IconCheck } from '@/components/Icons';
import { site } from '@/lib/site';

/** Thank-you page WAJIB noindex — PRD §12 & §15 */
export const metadata = buildMetadata({
  title: 'Terima Kasih',
  description: 'Permintaan penawaran Anda telah kami terima.',
  path: '/terima-kasih',
  noindex: true,
});

export default function ThankYouPage() {
  return (
    <div className="container-page py-20 text-center sm:py-28">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-500 text-white">
        <IconCheck className="h-8 w-8" strokeWidth={3} />
      </span>
      <h1 className="mt-6 text-3xl">Terima kasih, permintaan Anda sudah kami terima</h1>
      <p className="prose-brand mx-auto mt-4 max-w-xl">
        Tim kami akan menghubungi Anda pada jam kerja ({site.openingHours}) untuk mengonfirmasi
        detail area dan menjadwalkan survei. Estimasi final diberikan setelah kondisi lantai
        diperiksa.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/portofolio" className="btn-primary">Lihat Portofolio</Link>
        <Link href="/blog" className="btn-outline">Baca Artikel</Link>
      </div>
    </div>
  );
}
