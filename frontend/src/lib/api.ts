export interface Variant {
  label: string;
  color?: string;
  fragrance?: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  collection: string;
  images: { url: string; alt: string }[];
  variants: Variant[];
  details: { label: string; value: string }[];
  active: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  order: number;
}

export interface Settings {
  home: { tagline: string; intro: string };
  announcement: { active: boolean; text: string };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  socials: { label: string; href: string }[];
  shipping: { fee: number; freeOver: number; note: string };
  wall: {
    title: string;
    caption: string;
    to: string;
    image: string;
    active: boolean;
  }[];
  governorates: string[];
  about: {
    headline: string;
    intro: string[];
    portrait: string;
    chapters: { tag: string; title: string; lines: string[] }[];
    closing: string;
    spiral: string[];
  };
  contactPage: {
    heading: string;
    intro: string;
    slides: string[];
    faq: { q: string; a: string }[];
  };
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// In development, use Vite's proxy.
// In production, use the Render backend URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function api<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const r = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  const body = await r.json().catch(() => null);

  if (!r.ok) {
    throw new ApiError(
      r.status,
      body?.issues?.[0]?.message ?? body?.error ?? 'Request failed'
    );
  }

  return body as T;
}

export const totalStock = (p: Product) =>
  p.variants.reduce((n, v) => n + v.stock, 0);

const tones = [
  'var(--pink)',
  'var(--butter)',
  'var(--green)',
  'var(--peach)',
  'var(--lavender)',
  'var(--cream)',
  'var(--coral)',
];

export const toneFor = (key: string) =>
  tones[[...key].reduce((n, c) => n + c.charCodeAt(0), 0) % tones.length];