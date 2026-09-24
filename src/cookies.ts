const CONSENT_KEY = 'vf_cookie_consent';
const META_PIXEL_ID = 'REPLACE_ME_META_PIXEL_ID';
const GA4_MEASUREMENT_ID = 'G-REPLACE_ME';

export type ConsentValue = 'accepted' | 'declined';

export function getStoredConsent(storage: Pick<Storage, 'getItem'>): ConsentValue | null {
  const value = storage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function loadMetaPixel(pixelId: string): void {
  if (document.getElementById('meta-pixel-script')) return;
  const script = document.createElement('script');
  script.id = 'meta-pixel-script';
  script.textContent = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
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
    loadMetaPixel(META_PIXEL_ID);
    loadGA4(GA4_MEASUREMENT_ID);
  } else if (stored === null) {
    banner.hidden = false;
  }

  acceptBtn.addEventListener('click', () => {
    window.localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.hidden = true;
    loadMetaPixel(META_PIXEL_ID);
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
