# Reboot Market

A storefront for graded, warrantied second-hand electronics. Next.js (App Router) + TypeScript + Tailwind CSS v4, with a Postgres database via Prisma, email/password accounts, and order history.

## What's included

- **Home** (`/`), **Shop** (`/shop`) with category/grade filters, **Product detail** (`/product/[slug]`)
- **Accounts**: `/register`, `/login`, `/account` (order history) — email + password, sessions via signed HTTP-only cookie
- **Cart** (`/cart`) — persists to `localStorage`, checkout writes a real `Order` to the database
- **Sell** (`/sell`) — submissions saved to a `ListingSubmission` table for review
- **API routes** under `src/app/api/`: `auth/register`, `auth/login`, `auth/logout`, `auth/me`, `products`, `products/[slug]`, `orders`, `listings`

Database schema is in `prisma/schema.prisma`: `User`, `Product`, `Order`, `OrderItem`, `ListingSubmission`.

## Set up the database (do this first)

1. In the Vercel dashboard: **Storage → Create Database**, choose **Prisma Postgres** (or connect a free [Neon](https://neon.tech) database instead — either works).
2. Connect it to this project. Vercel adds several env vars automatically (`DATABASE_URL`, `POSTGRES_URL`, `PRISMA_DATABASE_URL`, etc.) — this project only needs **`POSTGRES_URL`**, which the integration creates for you. No manual copying needed.
3. Also add an env var **`SESSION_SECRET`** — any long random string (e.g. generate one at https://generate-secret.vercel.app/32).

The build script (`prisma generate && prisma db push && next build`) creates all the tables automatically on first deploy — no manual migration step needed.

## Seed starter products

After your first successful deploy, seed the catalog once from your own machine (or Vercel's dashboard isn't needed for this — any machine with Node and the `POSTGRES_URL` works):

```bash
npm install
POSTGRES_URL="<paste from Vercel>" npm run seed
```

## Run it locally

```bash
npm install
cp .env.example .env   # fill in POSTGRES_URL, SESSION_SECRET
npx prisma db push
npm run seed
npm run dev
```

## Deploy

### Push to GitHub, then import in Vercel
```bash
git remote add origin https://github.com/YOUR_USERNAME/reboot-market.git
git branch -M main
git push -u origin main
```
Then go to **vercel.com/new**, import the repo, add the database (see above), and click Deploy.

## Next steps

- **Payments**: `/cart` checkout currently just writes an `Order` with status `pending` — integrate Stripe Checkout to actually charge cards and flip status to `paid`.
- **Admin**: `POST /api/products` is gated by `role === "admin"` but nothing sets that role yet — set it manually on a user row in the database, or build an admin UI.
- **Real photos**: swap the emoji placeholders in `prisma/seed.ts` for real image URLs, and swap the emoji `<div>`s for `next/image`.
- **Email**: `SESSION_SECRET` login works, but there's no email verification or password reset flow yet.
