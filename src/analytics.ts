type Gtag = (...args: unknown[]) => void;

/** Sends a GA4 event. A no-op until the visitor accepts cookies (gtag is only loaded then). */
export function track(name: string, params: Record<string, unknown> = {}): void {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.('event', name, { strona: window.location.pathname, ...params });
}

/** Classifies a clicked link into a GA4 event name, or null if it isn't one we measure. */
export function classifyLink(href: string): string | null {
  if (href.startsWith('tel:')) return 'klik_telefon';
  if (href.startsWith('mailto:')) return 'klik_email';
  const path = href.replace(/^https?:\/\/(www\.)?vendingfresh\.pl/, '');
  if (path.startsWith('/konfigurator')) return 'klik_konfigurator';
  if (path.startsWith('/oferta')) return 'klik_oferta';
  if (path.startsWith('/kontakt')) return 'klik_kontakt';
  return null;
}
