# ARTISRA — handmade candle shop (React + Vite + Express + MongoDB)

## 1. Requirements
Node.js 20+, and MongoDB (local install, or a free MongoDB Atlas cluster).

## 2. Database
- Local: start `mongod`; use `MONGODB_URI=mongodb://127.0.0.1:27017/artisra`.
- Atlas: create a cluster, add a database user, allow your IP, copy the connection string into `MONGODB_URI`.

## 3. Server
```
cd server
cp .env.example .env     # then edit: MONGODB_URI, JWT_SECRET (32+ random chars), ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed             # creates the 4 collections, 16 demo products and YOUR admin account
npm run dev              # http://localhost:4000/api/health
```
The seed never overwrites products you already edited. Demo prices and a demo stock of 10 are placeholders: change them in the admin.

### If admin login fails or the server logs "no valid password hash"
An old/foreign admin record can exist in the same database (for example from another project) without a valid `passwordHash`. Fix it safely:
```
cd server
npm run admin:repair
```
It only touches the Admin collection, only the account matching `ADMIN_EMAIL`, and only if its hash is missing or malformed (it then sets the password from `ADMIN_PASSWORD`). A valid existing password is never changed, no duplicate account is created, and products, orders and settings are untouched. `npm run seed` does the same check. Run `npm test` for the password unit tests.

## 4. Website
```
cd frontend
npm install
npm run dev              # http://localhost:5173
```
Admin dashboard: http://localhost:5173/admin (sign in with ADMIN_EMAIL / ADMIN_PASSWORD).

## 5. Production
`npm run build` in both folders. Serve `frontend/dist` as static files and proxy `/api` and `/uploads` to the server (same domain). Set `NODE_ENV=production` and `CLIENT_ORIGIN` to your site URL. Back up the `server/uploads` folder.

## 6. Managing images (no code needed)
Admin → Products / Collections: upload, add several, replace, delete, reorder, and pick the main (first) image; images are previewed at once and saved with the Save button.
Admin → Website: homepage wall tiles (upload, replace, show/hide, reorder, caption, link). Admin → About page and Contact page: all text, photos, the 3D-spiral images and the slideshow.
Uploads are checked (JPEG/PNG/WebP/AVIF, max 5 MB, real file signature), stored in `server/uploads`, and referenced from MongoDB. A missing file shows a placeholder, never a broken icon.

## 7. What is in the admin
Orders and statuses (cancelling restocks), products (images with upload/reorder, variants, stock, prices, visibility, details), collections, customer inquiries, homepage artwork wall, announcement banner, contact details, social links, shipping fee.
