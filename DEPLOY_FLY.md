# 🚀 Deploying KnightOwl Backend to Fly.io

This guide will help you deploy your backend to **Fly.io** with a **Persistent Volume** to ensure your data stays safe forever.

---

### Step 1: Install Fly.io CLI (flyctl)

Open your **PowerShell** on your PC and run this command:
```powershell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```
*Note: If that doesn't work, try standard PowerShell:*
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

---

### Step 2: Log In & Authenticate

1.  In your terminal, run:
    ```bash
    fly auth login
    ```
2.  A browser window will open. Log in or create a free account.

---

### Step 3: Initialize your App

1.  Navigate into your **`backend`** folder:
    ```bash
    cd c:\Users\Gaurav\Downloads\knightowl-push-ready\gst-updated\backend
    ```
2.  Initialize the app:
    ```bash
    fly launch
    ```
    *   **App Name**: Press Enter to auto-generate or type `knightowl-backend`.
    *   **Select Organization**: Choose your personal one.
    *   **Select Region**: Choose a region close to your users (e.g., `bom` for Mumbai, or `sin` for Singapore).
    *   **Do you want to tweak settings?**: Type `n` (No).

---

### Step 4: Add Persistent Disk (Crucial!)

To ensure your data stays safe, we need to create a free 1GB disk (Volume).

1.  Run this command to create the volume:
    ```bash
    fly volumes create data_volume --size 1
    ```
    *   Select the **same region** you chose in Step 3.

2.  Open **`fly.toml`** (generated in your backend folder) and add this block at the end:
    ```toml
    [mounts]
      source = "data_volume"
      destination = "/app/data"
    ```

---

### Step 5: Add Environment Variables

Set your Supabase keys securely so the app can connect to your database:

```bash
fly secrets set SUPABASE_URL="https://your-project.supabase.co"
fly secrets set SUPABASE_SERVICE_KEY="your_service_role_key"
```

---

### Step 6: Deploy 🚀

Finally, push your app live:
```bash
fly deploy
```

Once complete, it will output your URL (e.g., `https://knightowl-backend.fly.dev`). 

---

### Next Step: Frontend on Vercel
Go to Vercel and set `VITE_API_URL` to your new **Fly.io** URL.
