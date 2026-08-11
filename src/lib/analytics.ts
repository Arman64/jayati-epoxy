/**
 * Event tracking — PRD §13.
 * Push ke dataLayer (GTM) bila tersedia; aman dipanggil saat GTM belum dipasang.
 */

export type TrackEvent =
  | 'whatsapp_click'
  | 'phone_click'
  | 'quotation_form_start'
  | 'quotation_form_submit'
  | 'file_upload_success'
  | 'schedule_survey_click'
  | 'cta_click'
  | 'scroll_50'
  | 'scroll_90'
  | 'lp_view'
  | 'calculator_use';

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: TrackEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const payload: Record<string, unknown> = {
    event,
    page_path: url.pathname,
    page_type: inferPageType(url.pathname),
    campaign: url.searchParams.get('utm_campaign') ?? undefined,
    gclid: url.searchParams.get('gclid') ?? undefined,
    utm_source: url.searchParams.get('utm_source') ?? undefined,
    utm_medium: url.searchParams.get('utm_medium') ?? undefined,
    ...params,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[track]', event, payload);
  }
}

export function inferPageType(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/lp/')) return 'landing_page';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/portofolio')) return 'portfolio';
  if (pathname.startsWith('/area-layanan')) return 'location';
  if (pathname.startsWith('/harga')) return 'pricing';
  if (pathname.startsWith('/kontak')) return 'contact';
  return 'service';
}
