import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './config.js';
import { HttpError } from './util.js';

export { hashPassword, verifyPassword } from './password.js';

const COOKIE = 'artisra_admin';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

export const setSession = (res: Response, id: string) => {
  const token = jwt.sign(
    { sub: id },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.cookie(COOKIE, token, cookieOptions);
};

export const clearSession = (res: Response) => {
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  });
};

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    jwt.verify(req.cookies?.[COOKIE] ?? '', env.JWT_SECRET);

    const origin = req.get('origin');

    if (
      req.method !== 'GET' &&
      origin &&
      origin !== env.CLIENT_ORIGIN
    ) {
      throw new HttpError(403, 'Origin not allowed');
    }

    next();
  } catch (e) {
    next(
      e instanceof HttpError
        ? e
        : new HttpError(401, 'Not signed in')
    );
  }
}