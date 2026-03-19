# 🚀 Remaining Steps: Deploy Backend to Fly.io

Since you have already **Installed Fly.io**, **Logged In**, and **Set up Supabase**, here are the final steps to make your backend live.

---

### Step 1: Initialize Your App (`fly launch`)

You must run this command inside the `backend` directory.

1.  Open your **PowerShell** and run:
    ```powershell
    cd c:\Users\Gaurav\Downloads\knightowl-push-ready\gst-updated\backend
    fly launch
    ```
2.  **Follow the Prompts**:
    *   **App Name**: Press Enter to auto-generate, or type `knightowl-backend`.
    *   **Select Region**: Choose a region close to you (e.g., `bom` for Mumbai, or `sin` for Singapore).
    *   **Do you want to tweak settings?**: Type **`n`** (No).

---

### Step 2: Add Persistent Disk (To Save Data)

If you don't create a volume, your files will get deleted on restart.

1.  Run this command to create a free 1GB disk (Replace with your region choice if different):
    ```bash
    fly volumes create data_volume --size 1
    ```
2.  Open the file **`fly.toml`** (Now created inside your `backend` folder) in a text editor (Notepad, VS Code).
3.  Scroll to the **very bottom** and add this block:
    ```toml
    [mounts]
      source = "data_volume"
      destination = "/app/data"
    ```
4.  **Save and close** the file.

---

### Step 3: Add Your Supabase Keys

Set your live database connection keys (Replace with your actual keys from Supabase settings):

```bash
fly secrets set SUPABASE_URL="https://your-project.supabase.co"
fly secrets set SUPABASE_SERVICE_KEY="your_service_role_key"
```

---

### Step 4: Deploy Live! 🚀

Once satisfied with settings, run:

```bash
fly deploy
```

When finished, copy your Backend URL (e.g., `https://your-app.fly.dev`) to connect your **Vercel** frontend!
