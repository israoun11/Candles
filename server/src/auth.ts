import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './config.js';
import { HttpError } from './util.js';

export { hashPassword, verifyPassword } from './password.js';
const COOKIE = 'artisra_admin';
export const setSession = (res: Response, id: string) =>
  res.cookie(COOKIE, jwt.sign({ sub: id }, env.JWT_SECRET, { expiresIn: '8h' }),
    { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', maxAge: 8 * 3600_000 });
export const clearSession = (res: Response) => res.clearCookie(COOKIE);

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    jwt.verify(req.cookies?.[COOKIE] ?? '', env.JWT_SECRET);
    // Mutating requests must come from our own site (CSRF guard on top of SameSite).
    const origin = req.get('origin');
    if (req.method !== 'GET' && origin && origin !== env.CLIENT_ORIGIN) throw new HttpError(403, 'Origin not allowed');
    next();
  } catch (e) { next(e instanceof HttpError ? e : new HttpError(401, 'Not signed in')); }
}
