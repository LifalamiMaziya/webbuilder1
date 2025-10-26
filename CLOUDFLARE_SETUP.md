# Cloudflare Dashboard Setup Guide

Complete step-by-step guide to set up your WebBuilder project on Cloudflare.

## Prerequisites
- ✅ Cloudflare account (sign up at https://dash.cloudflare.com/sign-up)
- ✅ E2B account with API key (sign up at https://e2b.dev)
- ✅ Wrangler CLI installed (`npm install -g wrangler`)

---

## Step 1: Login to Cloudflare via Wrangler

Open your terminal and run:

```bash
wrangler login
```

This will:
1. Open your browser
2. Ask you to authorize Wrangler
3. Save your credentials locally

**Verify login:**
```bash
wrangler whoami
```

You should see your Cloudflare account email.

---

## Step 2: Create D1 Database

D1 is Cloudflare's serverless SQL database (similar to SQLite).

### 2.1 Create the Database

```bash
wrangler d1 create webbuilder-db
```

**Expected Output:**
```
✅ Successfully created DB 'webbuilder-db'!

[[d1_databases]]
binding = "DB"
database_name = "webbuilder-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT:** Copy the `database_id` - you'll need it next!

### 2.2 Update wrangler.jsonc

Open `wrangler.jsonc` and replace `YOUR_DATABASE_ID` with the ID you just copied:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "webbuilder-db",
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // ← Put your ID here
  }
]
```

### 2.3 Run Database Migrations

**For local development:**
```bash
wrangler d1 execute webbuilder-db --local --file=./drizzle/0000_initial.sql
```

**For production (remote):**
```bash
wrangler d1 execute webbuilder-db --remote --file=./drizzle/0000_initial.sql
```

**Verify the tables were created:**
```bash
wrangler d1 execute webbuilder-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

You should see: `users`, `projects`, `project_files`, `sessions`

---

## Step 3: Create R2 Bucket (File Storage)

R2 is Cloudflare's S3-compatible object storage.

### 3.1 Create the Bucket

```bash
wrangler r2 bucket create webbuilder-files
```

**Expected Output:**
```
✅ Created bucket 'webbuilder-files'
```

### 3.2 Verify in Dashboard (Optional)

1. Go to https://dash.cloudflare.com
2. Click on **R2** in the left sidebar
3. You should see `webbuilder-files` bucket

The R2 binding is already configured in `wrangler.jsonc`:
```jsonc
"r2_buckets": [
  {
    "binding": "R2",
    "bucket_name": "webbuilder-files"
  }
]
```

---

## Step 4: Set Up Environment Variables

### 4.1 Create .env.local for Local Development

Create a file `.env.local` in the project root:

```bash
# Copy from example
cp .env.example .env.local
```

Edit `.env.local` and add your values:

```env
# Your E2B API Key (get from https://e2b.dev/dashboard)
E2B_API_KEY=e2b_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Generate a random secret (minimum 32 characters)
AUTH_SECRET=your-super-secret-random-string-min-32-characters-here

# Optional: For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate a secure AUTH_SECRET:**
```bash
# Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use an online tool: https://generate-secret.vercel.app/32
```

### 4.2 Add Secrets to Cloudflare Workers

For production, add secrets to Cloudflare:

```bash
# Add E2B API Key
wrangler secret put E2B_API_KEY
# Paste your E2B API key when prompted

# Add Auth Secret
wrangler secret put AUTH_SECRET
# Paste your AUTH_SECRET when prompted
```

**Verify secrets were added:**
```bash
wrangler secret list
```

### 4.3 Update wrangler.jsonc with E2B_API_KEY

Your `wrangler.jsonc` should already have this section. Update it:

```jsonc
"vars": {
  "E2B_API_KEY": ""  // Empty for local, will use secrets in production
}
```

---

## Step 5: Test Locally

### 5.1 Run Development Server

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
```

### 5.2 Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Get Started" to sign up
3. Create an account (email + password)
4. You should be redirected to the dashboard
5. Click "New Project" to create your first project

**Troubleshooting Local Development:**
- If database errors occur, make sure you ran the local migration:
  ```bash
  wrangler d1 execute webbuilder-db --local --file=./drizzle/0000_initial.sql
  ```
- Check that `.env.local` has your `E2B_API_KEY`

---

## Step 6: Deploy to Cloudflare

### 6.1 Build the Project

```bash
npm run build
```

This will:
1. Build your Next.js app
2. Create optimized production bundles
3. Generate Cloudflare Worker files in `.open-next/`

### 6.2 Deploy to Cloudflare

```bash
npm run deploy
```

**Expected Output:**
```
✨ Compiled Worker successfully
🌎 Uploading...
✨ Success! Deployed to https://webbuilder1.YOUR_SUBDOMAIN.workers.dev
```

**Your app is now live!** 🎉

---

## Step 7: Verify Deployment

### 7.1 Check Workers Dashboard

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages** in the left sidebar
3. You should see `webbuilder1`
4. Click on it to see:
   - Deployment status
   - Live URL
   - Logs
   - Metrics

### 7.2 Check D1 Database

1. In Cloudflare Dashboard, click **D1** in left sidebar
2. Click on `webbuilder-db`
3. Click **Console** tab
4. Run a query to verify:
   ```sql
   SELECT * FROM users;
   ```

### 7.3 Test the Live App

1. Visit your deployed URL: `https://webbuilder1.YOUR_SUBDOMAIN.workers.dev`
2. Sign up with a new account
3. Create a test project
4. Verify the project editor loads with:
   - File tree on the left
   - Code editor in the middle
   - Live preview on the right

---

## Step 8: Custom Domain (Optional)

### 8.1 Add a Custom Domain

1. In Workers dashboard, click on `webbuilder1`
2. Go to **Settings** → **Triggers**
3. Click **Add Custom Domain**
4. Enter your domain (e.g., `webbuilder.yourdomain.com`)
5. Cloudflare will automatically configure SSL

### 8.2 Update AUTH_SECRET Origins

Edit `src/lib/auth/index.ts` and add your custom domain:

```typescript
trustedOrigins: [
  'http://localhost:3000',
  'https://webbuilder1.pages.dev',
  'https://webbuilder.yourdomain.com',  // ← Add your domain
],
```

Redeploy:
```bash
npm run deploy
```

---

## Step 9: Monitor Your Application

### 9.1 View Logs

**Real-time logs:**
```bash
wrangler tail
```

**Or in Dashboard:**
1. Go to Workers dashboard
2. Click on `webbuilder1`
3. Click **Logs** → **Begin log stream**

### 9.2 View Metrics

In the Workers dashboard:
- **Requests**: Total requests per day
- **Errors**: Error rate and types
- **CPU Time**: Worker execution time
- **Success Rate**: % of successful requests

### 9.3 Monitor D1 Usage

1. Go to D1 dashboard
2. Click on `webbuilder-db`
3. See:
   - Total rows
   - Storage used
   - Read/write operations

---

## Step 10: E2B Configuration

### 10.1 Get Your E2B API Key

1. Go to https://e2b.dev
2. Sign up or log in
3. Go to **Dashboard** → **API Keys**
4. Create a new API key
5. Copy it to your `.env.local` and Cloudflare secrets

### 10.2 Verify E2B Integration

1. Create a new project in your app
2. Check that the E2B sandbox is created (status should change from "creating" to "active")
3. Open the project editor
4. Files should load in the file tree
5. Live preview should show the Next.js default page

**Troubleshooting E2B:**
- **"Sandbox creation failed"**: Check your E2B API key is correct
- **"Quota exceeded"**: Check your E2B plan limits at https://e2b.dev/pricing
- **"Timeout errors"**: E2B sandboxes take ~30 seconds to initialize on first creation

---

## Cloudflare Free Tier Limits

Your app should work fine on the free tier:

| Service | Free Tier Limit | Notes |
|---------|-----------------|-------|
| **Workers** | 100,000 requests/day | More than enough for development |
| **D1** | 5 GB storage, 5M row reads/day | Plenty for small projects |
| **R2** | 10 GB storage, 1M reads/month | Good for file backups |
| **Pages** | Unlimited requests | If you deploy via Pages instead |

**Upgrade when needed:**
- Workers: $5/month for 10M requests
- D1: Pay as you go beyond free tier
- R2: $0.015/GB/month beyond 10 GB

---

## Common Issues & Solutions

### Issue: "Database not found" error

**Solution:**
```bash
# Re-run migrations
wrangler d1 execute webbuilder-db --remote --file=./drizzle/0000_initial.sql

# Verify tables exist
wrangler d1 execute webbuilder-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Issue: "Authentication failed" errors

**Solution:**
1. Check `AUTH_SECRET` is set in Cloudflare secrets:
   ```bash
   wrangler secret list
   ```
2. If missing, add it:
   ```bash
   wrangler secret put AUTH_SECRET
   ```

### Issue: "E2B sandbox creation fails"

**Solution:**
1. Verify E2B API key in secrets:
   ```bash
   wrangler secret list
   ```
2. Check E2B account status at https://e2b.dev/dashboard
3. Verify you have available quota

### Issue: "Monaco editor not loading"

**Solution:**
- Monaco requires client-side rendering
- Make sure the component has `'use client'` directive
- Clear browser cache and reload

### Issue: "Live preview shows blank screen"

**Solution:**
1. Check that the E2B sandbox is in "active" status
2. Wait ~30 seconds for Next.js dev server to start
3. Click the "Refresh" button in the preview pane
4. Check browser console for CORS errors

---

## Next Steps

✅ **You're all set!** Your project management dashboard is now deployed on Cloudflare.

**Recommended next steps:**
1. **Add a custom domain** for a professional URL
2. **Set up monitoring** with Cloudflare Analytics
3. **Configure rate limiting** in Workers settings
4. **Add email verification** in Better Auth config
5. **Set up CI/CD** with GitHub Actions (optional)

**Need help?**
- Cloudflare Docs: https://developers.cloudflare.com
- E2B Docs: https://e2b.dev/docs
- Better Auth Docs: https://www.better-auth.com/docs

---

## Quick Reference Commands

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create webbuilder-db

# Run migrations (local)
wrangler d1 execute webbuilder-db --local --file=./drizzle/0000_initial.sql

# Run migrations (production)
wrangler d1 execute webbuilder-db --remote --file=./drizzle/0000_initial.sql

# Create R2 bucket
wrangler r2 bucket create webbuilder-files

# Add secrets
wrangler secret put E2B_API_KEY
wrangler secret put AUTH_SECRET

# List secrets
wrangler secret list

# Build project
npm run build

# Deploy to Cloudflare
npm run deploy

# View logs
wrangler tail

# Run locally
npm run dev
```

---

**Happy building!** 🚀
