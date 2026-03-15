# KnightOwl GST — Live Deployment Guide

## Architecture
```
Browser → Vercel (Frontend) → Railway (Backend API) → Supabase (Auth + DB)
```

---

## Step 1 — Supabase Setup (5 minutes)

1. Go to **supabase.com** → New project
2. Name it `knightowl-gst`
3. Go to **SQL Editor** and run:

```sql
-- Profiles table (one row per CA firm user)
create table profiles (
  id uuid references auth.users primary key,
  email text,
  firm_name text not null,
  firm_id text not null unique,
  role text default 'admin',
  plan text default 'starter',
  created_at timestamptz default now()
);

-- Allow users to read/write their own profile
alter table profiles enable row level security;
create policy "Users can view own profile"  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
```

4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_KEY` (keep secret!)

5. Go to **Authentication → Settings**:
   - Enable Email/Password sign-in
   - Set Site URL to your Vercel URL (after deploying frontend)

---

## Step 2 — Deploy Backend to Railway (3 minutes)

1. Go to **railway.app** → New Project → Deploy from GitHub
2. Select your repo → choose the `backend/` folder
3. Add environment variables:
```
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
DATA_DIR=/app/data
FRONTEND_URL=https://your-app.vercel.app
```
4. Railway auto-detects the Dockerfile and deploys
5. Copy the Railway URL → e.g. `https://knightowl-api.up.railway.app`

**Alternative: Render.com**
- New Web Service → Connect repo → Root directory: `backend`
- Same env vars as above

---

## Step 3 — Deploy Frontend to Vercel (2 minutes)

1. Go to **vercel.com** → Import Git Repository
2. Set **Root Directory** to `frontend`
3. Add environment variables:
```
VITE_API_URL=https://knightowl-api.up.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME=KnightOwl GST
```
4. Deploy → copy your Vercel URL
5. Go back to Supabase → Authentication → Site URL → paste your Vercel URL

---

## Step 4 — Custom Domain (optional)

In Vercel:
- Settings → Domains → Add `app.knightowlgst.com`
- Update Supabase Site URL to match

---

## Step 5 — Test

1. Open your Vercel URL
2. You should see the KnightOwl landing page
3. Click "Start free trial" → register with your email
4. Upload Lucichem May 2025 PR + GSTR-2B files
5. See reconciliation results

---

## Cost (Monthly)

| Service | Free tier | Paid |
|---|---|---|
| Vercel | 100GB bandwidth | $20/mo |
| Railway | $5 free credits | ~$5-15/mo |
| Supabase | 50k MAU, 500MB DB | $25/mo |
| **Total** | **Free to start** | **~$40-50/mo** |

Your revenue from selling to CA firms (₹999–₹5,999/month each) will cover this at the first client.

---

## Selling to CA Firms

1. Share: `https://your-app.vercel.app`
2. Each firm registers with their email + firm name
3. They get isolated data — other firms cannot see their data
4. You manage plans via Supabase → `profiles` table → update `plan` column

To upgrade a client to Professional:
```sql
update profiles set plan = 'professional' where email = 'client@firm.com';
```

---

## Local Development

```bash
# 1. Clone and install
cd backend  && npm install
cd frontend && npm install

# 2. Add your Supabase keys to .env files

# 3. Start both
./START_DEV.sh    # Mac/Linux
START_APP.bat     # Windows
```
