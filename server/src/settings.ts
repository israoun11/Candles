import { DEFAULT_SETTINGS } from './data.js';
import { Setting } from './models.js';

export type SiteSettings = typeof DEFAULT_SETTINGS;
export async function getSettings(): Promise<SiteSettings> {
  const doc = await Setting.findOne({ key: 'site' });
  return { ...DEFAULT_SETTINGS, ...((doc?.data as Partial<SiteSettings>) ?? {}) };
}
