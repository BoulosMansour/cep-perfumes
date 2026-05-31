# Deployment Guide

Follow these steps in order. Takes ~15 minutes total.

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `cep-perfumes`) and a strong database password. Save the password.
3. Once the project is ready, go to **SQL Editor** → **New Query**
4. Paste the contents of `supabase/schema.sql` and click **Run**
5. Go to **Project Settings → API** and copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public** key → this is your `VITE_SUPABASE_ANON_KEY`
6. Go to **Authentication → Users** → **Add User** → create the admin account
   (email + password — this is the only account that can log in to `/admin`)

---

## 2. Cloudflare Pages Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create**
2. Choose **Pages → Connect to Git** and authorise your GitHub account
3. Select this repository (`cep-perfumes`)
4. Build settings:
   | Setting | Value |
   |---|---|
   | Framework preset | None (leave blank) |
   | Build command | `cd cep-perfumes && npm ci && npm run build` |

   > If Cloudflare asks for a **Build output directory**, set it to `cep-perfumes/dist`.
5. Under **Environment variables**, add:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
6. Click **Save and Deploy** — the first deploy runs now.
7. Note your **Cloudflare Account ID** from the URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`

---

## 3. GitHub Secrets (for the auto-deploy Action)

In your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret name | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon/public key) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard URL or **Workers & Pages → Settings** |
| `CLOUDFLARE_API_TOKEN` | See below |

### Creating a Cloudflare API Token
1. Cloudflare dashboard → **My Profile → API Tokens → Create Token**
2. Use template **"Edit Cloudflare Workers"** (it includes Pages permissions)
3. Or **Custom Token** with permissions: **Account → Cloudflare Pages → Edit**
4. Copy the token and add it as `CLOUDFLARE_API_TOKEN`

---

## 4. Local Development

```bash
# Inside cep-perfumes/
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (never commit this file)
# WhatsApp numbers are managed in the admin panel — no env var needed

npm install
npm run dev
```

Visit `http://localhost:5173` for the store, `http://localhost:5173/admin` for the admin portal.

---

## 5. How to Access the Admin Portal

Navigate directly to `https://your-site.pages.dev/admin` (or your custom domain).  
There is no link to it from the public store — enter the URL manually.

---

## 6. Post-Deploy Checklist

- [ ] Store page loads products (initially empty)
- [ ] `/admin` shows login form
- [ ] Admin can log in with the Supabase user created in step 1
- [ ] Admin can add a WhatsApp number (label + number) in the **WhatsApp Numbers** panel
- [ ] WhatsApp button appears on the store and opens the correct number
- [ ] Adding a second number shows a popup menu on the store with both options
- [ ] Admin can toggle a number active/inactive
- [ ] Admin can add a product with an image
- [ ] Product appears on the store page
- [ ] Admin can edit and delete products
- [ ] Pushing to `main` triggers automatic re-deploy via GitHub Actions
