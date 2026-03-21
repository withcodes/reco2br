# 🚀 Full Deployment Guide: Render + Vercel (No Card Required)

This guide will help you deploy your backend on **Render.com** and your frontend on **Vercel** easily.

---

### 🛡️ Part 1: Supabase Setup (5 Minutes)

1.  Log in to **[supabase.com](https://supabase.com)** and create a **New Project**.
2.  Go to the **SQL Editor** (left sidebar) → **New Query** and run this code:
    ```sql
    create table profiles (
      id uuid references auth.users primary key,
      email text,
      firm_name text not null,
      firm_id text not null unique,
      role text default 'admin',
      plan text default 'starter',
      created_at timestamptz default now()
    );

    alter table profiles enable row level security;
    create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
    create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
    create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
    ```
3.  Go to **Project Settings** (gear icon) → **API** and copy these 3 keys safely:
    *   `Project URL` (Your **`SUPABASE_URL`**)
    *   `anon public` (Your **`VITE_SUPABASE_ANON_KEY`**)
    *   `service_role` (Your **`SUPABASE_SERVICE_KEY`**)

---

### ☁️ Part 2: Deploy Backend to Render (3 Minutes)

1.  Go to **[render.com](https://render.com)** and log in with GitHub.
2.  Click **New +** (top right) → Select **Web Service**.
3.  Select your GitHub repository (`reco2br`).
4.  **Configure Settings**:
    *   **Name**: *(Choose any name, e.g., `my-custom-backend`)*
    *   **Root Directory**: Type **`backend-python`**
    *   **Runtime**: Select **`Docker`**
5.  Scroll down to **Environment Variables** and add these 3 items:

| Key | Value |
| :--- | :--- |
| `SUPABASE_URL` | *Your Supabase URL from Part 1* |
| `SUPABASE_SERVICE_KEY` | *Your Supabase service_role key from Part 1* |
| `DATA_DIR` | `/opt/render/project/src/data` |

6.  Click **Create Web Service**. 
    *Wait 3 minutes for it to say "Live".*
7.  **Copy your Backend URL** (e.g., `https://my-custom-backend.onrender.com`).

---

### 🚀 Part 3: Deploy Frontend to Vercel (2 Minutes)

1.  Go to **[vercel.com](https://vercel.com)** and log in with GitHub.
2.  Click **Add New** → **Project** → Select your repository (`reco2br`).
3.  **Configure**:
    *   **Root Directory**: Type **`frontend`**
4.  Expand **Environment Variables** and add these 3 items:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | *Your Render Backend URL from Part 2* |
| `VITE_SUPABASE_URL` | *Your Supabase URL from Part 1* |
| `VITE_SUPABASE_ANON_KEY` | *Your Supabase anon public key from Part 1* |

5.  Click **Deploy**.

---

### 🔗 Final Step
Once Vercel gives you your live dashboard link (e.g., `https://your-app.vercel.app`):
1.  Go view **Supabase** → **Authentication** → **URL Configuration**.
2.  Set the **Site URL** to match your new Vercel URL so logins work perfectly.
