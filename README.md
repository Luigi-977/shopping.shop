# Reboot Market

A storefront for graded, warrantied second-hand electronics. Built with Next.js (App Router), TypeScript, and Tailwind CSS v4.

## What's included

- **Home** (`/`) — hero, grading key, featured listings
- **Shop** (`/shop`) — full catalog with category and grade filters
- **Product detail** (`/product/[slug]`) — specs, condition notes, add to cart
- **Cart** (`/cart`) — quantities, subtotal, demo checkout (persists to `localStorage`)
- **Sell** (`/sell`) — demo listing submission form

Product data lives in `src/lib/products.ts` — edit that array to add/remove real inventory. There's no database yet; cart state is client-side only.

## Run it locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploy

### 1. Push to GitHub

```bash
gh repo create reboot-market --public --source=. --remote=origin --push
```

Or manually:
```bash
git remote add origin https://github.com/YOUR_USERNAME/reboot-market.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

Easiest: go to https://vercel.com/new, import the GitHub repo, and click Deploy — Next.js is auto-detected, no config needed.

Or via CLI:
```bash
npm i -g vercel
vercel
```

## Next steps to make this a real store

- **Real product data**: swap the hardcoded array in `src/lib/products.ts` for a database (Postgres via Vercel Postgres/Neon, or a headless CMS like Sanity).
- **Real checkout**: integrate Stripe Checkout or Stripe Elements — the "Checkout" button in `/cart` is currently a no-op demo.
- **Real product photos**: replace the emoji placeholders in `src/lib/products.ts` with actual image URLs and swap the emoji `<div>` in `ProductCard.tsx` / product page for `next/image`.
- **Accounts**: add auth (NextAuth/Auth.js or Clerk) if you want buyer/seller accounts and order history.
- **Sell form backend**: connect `/sell` to an API route that saves submissions to your database instead of just showing a confirmation.
