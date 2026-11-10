# CEP Perfumes

Online catalogue for a small perfume shop. Visitors browse the products and order through WhatsApp; the owner manages products, photos and WhatsApp contacts from a password-protected admin page. Built for a friend's business and deployed automatically to Cloudflare Pages.

## Features

- **Store (`/`):** product grid with photo, price and description, plus a floating WhatsApp button that opens a chat with the shop (a picker appears when several numbers are active).
- **Admin (`/admin`):** email and password login with Supabase Auth; create, edit and delete products; upload product photos to Supabase Storage; manage the WhatsApp numbers shown in the store (label, active flag, order).
- **Security:** Postgres Row Level Security. Anyone can read; only the authenticated admin can write products, numbers and images.
- **CI/CD:** a GitHub Actions workflow builds the site and deploys it to Cloudflare Pages on every push to `main`.

## Tech stack

React 19 · TypeScript · Vite · React Router · Supabase (Postgres, Auth, Storage) · Cloudflare Pages · GitHub Actions

## Project structure

```
cep-perfumes/            # React + Vite app
  src/pages/Store.tsx    # public catalogue + WhatsApp ordering
  src/pages/Admin.tsx    # admin login and management
  src/lib/supabase.ts    # Supabase client
supabase/schema.sql      # tables, RLS policies, storage bucket
.github/workflows/       # build + deploy to Cloudflare Pages
DEPLOYMENT.md            # step-by-step setup guide
```

## Run locally

```bash
cd cep-perfumes
cp .env.example .env.local   # then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm ci
npm run dev
```

Create the database first by running `supabase/schema.sql` in the Supabase SQL editor.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Supabase, Cloudflare Pages and GitHub secrets setup (about 15 minutes).
