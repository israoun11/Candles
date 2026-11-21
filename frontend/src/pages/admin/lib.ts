import { api, API_BASE_URL } from '../../lib/api';

export const adminApi = <T,>(
  path: string,
  method = 'GET',
  body?: unknown
) =>
  api<T>(`/admin${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export async function uploadFiles(files: FileList | File[]): Promise<string[]> {
  const fd = new FormData();
  [...files].forEach((f) => fd.append('files', f));

  const r = await fetch(`${API_BASE_URL}/api/admin/uploads`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });

  const b = await r.json().catch(() => null);

  if (!r.ok) throw new Error(b?.error ?? 'Upload failed');

  return b.urls as string[];
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const STATUSES = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;