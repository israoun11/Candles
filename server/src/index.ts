import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from './config.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';
import { HttpError } from './util.js';

mkdirSync(resolve(env.UPLOAD_DIR), { recursive: true });
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(resolve(env.UPLOAD_DIR), { maxAge: '7d' }));
app.get('/api/health', (_q, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use('/api/admin/login', rateLimit({ windowMs: 15 * 60_000, limit: 10 }));
app.use(['/api/orders', '/api/inquiries'], rateLimit({ windowMs: 60_000, limit: 20, skip: (r) => r.method === 'GET' }));
app.use('/api/admin', adminRouter);
app.use('/api', publicRouter);
app.use('/api', (_q, _r, next) => next(new HttpError(404, 'Not found')));

app.use((e: unknown, _q: Request, res: Response, _n: NextFunction) => {
  if (e instanceof ZodError) return res.status(400).json({ error: 'Invalid data', issues: (e as ZodError).issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
  if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
  if (e instanceof multer.MulterError) return res.status(400).json({ error: (e as Error).message });
  if ((e as { code?: number })?.code === 11000) return res.status(409).json({ error: 'That slug or value already exists.' });
  console.error(e);
  res.status(500).json({ error: 'Something went wrong on our side.' });
});

await mongoose.connect(env.MONGODB_URI);
app.listen(env.PORT, () => console.log(`ARTISRA API listening on :${env.PORT}`));
