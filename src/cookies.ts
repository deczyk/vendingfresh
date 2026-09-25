const CONSENT_KEY = 'vf_cookie_consent';
const GA4_MEASUREMENT_ID = 'G-H5J462G4WM';

export type ConsentValue = 'accepted' | 'declined';

export function getStoredConsent(storage: Pick<Storage, 'getItem'>): ConsentValue | null {
  const value = storage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function loadGA4(measurementId: string): void {
  if (document.getElementById('ga4-script')) return;
  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const inline = document.createElement('script');
  inline.id = 'ga4-inline';
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(inline);
}

function initCookieBanner(): void {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  if (!banner || !acceptBtn || !declineBtn) return;

  const stored = getStoredConsent(window.localStorage);
  if (stored === 'accepted') {
    loadGA4(GA4_MEASUREMENT_ID);
  } else if (stored === null) {
    banner.hidden = false;
  }

  acceptBtn.addEventListener('click', () => {
    window.localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.hidden = true;
    loadGA4(GA4_MEASUREMENT_ID);
  });

  declineBtn.addEventListener('click', () => {
    window.localStorage.setItem(CONSENT_KEY, 'declined');
    banner.hidden = true;
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCookieBanner);
}
