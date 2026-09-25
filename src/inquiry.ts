import { track } from './analytics';

export interface InquiryInput {
  model: string;
  produkt: string;
  kraj: string;
  miasto: string;
  imie: string;
  telefon: string;
  email: string;
  zgoda: boolean;
  website: string;
  jezyk: string;
}

export interface InquiryMessages {
  product: string;
  contact: string;
  consent: string;
}

/** Returns the first validation message (already in the page's language), or null when valid. */
export function validateInquiry(input: InquiryInput, messages: InquiryMessages): string | null {
  if (input.produkt.trim() === '') return messages.product;
  if (input.telefon.trim() === '' && input.email.trim() === '') return messages.contact;
  if (!input.zgoda) return messages.consent;
  return null;
}

/** Maps the short foreign inquiry onto the konfigurator lead payload the API already accepts. */
export function toLeadPayload(input: InquiryInput): Record<string, unknown> {
  return {
    model: input.model,
    produkty: [],
    produktInne: input.produkt.trim(),
    miejscowoscKontakt: [input.miasto.trim(), input.kraj].filter(Boolean).join(', '),
    imie: input.imie.trim(),
    telefon: input.telefon.trim(),
    email: input.email.trim(),
    rodo: input.zgoda,
    website: input.website,
    jezyk: input.jezyk,
  };
}

function initInquiry(): void {
  const form = document.getElementById('inquiry-form') as HTMLFormElement | null;
  if (!form) return;
  const errorEl = form.querySelector<HTMLElement>('.config-error');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const d = form.dataset;
  const messages: InquiryMessages = {
    product: d.errProduct ?? '',
    contact: d.errContact ?? '',
    consent: d.errConsent ?? '',
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const input: InquiryInput = {
      model: String(data.get('model') ?? 'zakup'),
      produkt: String(data.get('produkt') ?? ''),
      kraj: String(data.get('kraj') ?? ''),
      miasto: String(data.get('miasto') ?? ''),
      imie: String(data.get('imie') ?? ''),
      telefon: String(data.get('telefon') ?? ''),
      email: String(data.get('email') ?? ''),
      zgoda: data.get('zgoda') === 'on',
      website: String(data.get('website') ?? ''),
      jezyk: d.lang ?? document.documentElement.lang,
    };
    const error = validateInquiry(input, messages);
    if (errorEl) errorEl.textContent = error ?? '';
    if (error) return;

    if (button) button.disabled = true;
    try {
      const response = await fetch('/api/konfigurator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marka: 'vendingfresh', typ: 'konfigurator', payload: toLeadPayload(input) }),
      });
      if (!response.ok) throw new Error('send failed');
      track('zapytanie_wyslane', { jezyk: input.jezyk, model: input.model });
      window.location.href = d.thanks ?? '/';
    } catch {
      if (errorEl) errorEl.textContent = d.errSend ?? '';
    } finally {
      if (button) button.disabled = false;
    }
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initInquiry);
}
