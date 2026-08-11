import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyCta } from '@/components/StickyCta';

/** Layout untuk seluruh halaman website publik (bukan landing page iklan). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="konten-utama" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}
