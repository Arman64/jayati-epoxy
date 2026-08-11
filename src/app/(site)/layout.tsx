import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyCta } from '@/components/StickyCta';
import { FloatingCta } from '@/components/FloatingCta';
import { buildWaLink, getSettings } from '@/lib/settings';

/** Layout untuk seluruh halaman website publik (bukan landing page iklan). */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const { cta, contact } = s;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="konten-utama" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      {cta.stickyMobileEnabled ? <StickyCta /> : null}
      {cta.floatingEnabled ? (
        <FloatingCta
          waHref={buildWaLink(contact, undefined, 'floating')}
          phoneHref={`tel:${contact.phoneE164}`}
          phoneDisplay={contact.phoneDisplay}
          label={cta.floatingLabel}
          showWhatsapp={cta.floatingWhatsapp}
          showPhone={cta.floatingPhone}
          delayMs={cta.floatingDelayMs}
          liftOnMobile={cta.stickyMobileEnabled}
        />
      ) : null}
    </div>
  );
}
