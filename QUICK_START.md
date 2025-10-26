# WebBuilder - Quick Start Guide

Get your project management dashboard running in 10 minutes!

## Prerequisites (2 minutes)

1. **E2B Account**: Sign up at https://e2b.dev (free tier available)
   - Get your API key from Dashboard → API Keys

2. **Cloudflare Account**: Sign up at https://dash.cloudflare.com (free tier)

3. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

## Setup Steps

### 1. Login to Cloudflare (1 minute)

```bash
wrangler login
```

This opens your browser to authorize Wrangler.

### 2. Create D1 Database (2 minutes)

```bash
# Create database
wrangler d1 create webbuilder-db
```

**IMPORTANT**: Copy the `database_id` from the output!

Edit `wrangler.jsonc` and replace `YOUR_DATABASE_ID`:
```jsonc
"database_id": "paste-your-id-here"
```

Run migrations:
```bash
wrangler d1 execute webbuilder-db --remote --file=./drizzle/0000_initial.sql
```

### 3. Create R2 Bucket (1 minute)

```bash
wrangler r2 bucket create webbuilder-files
```

### 4. Set Environment Variables (2 minutes)

Create `.env.local` file:
```env
E2B_API_KEY=your-e2b-api-key-here
AUTH_SECRET=any-random-string-min-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate AUTH_SECRET** (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Add secrets to Cloudflare:
```bash
wrangler secret put E2B_API_KEY
# Paste your E2B API key

wrangler secret put AUTH_SECRET
# Paste your AUTH_SECRET
```

### 5. Test Locally (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 and:
1. Click "Get Started"
2. Create an account
3. Create your first project!

### 6. Deploy to Cloudflare (2 minutes)

```bash
npm run build
npm run deploy
```

Your app is now live at: `https://webbuilder1.YOUR_SUBDOMAIN.workers.dev`

## Verification Checklist

✅ D1 database created and migrated
✅ R2 bucket created
✅ E2B_API_KEY set in secrets
✅ AUTH_SECRET set in secrets
✅ Local development works
✅ Deployed to Cloudflare

## Common Issues

### "Database not found"
```bash
wrangler d1 execute webbuilder-db --remote --file=./drizzle/0000_initial.sql
```

### "Authentication failed"
```bash
wrangler secret put AUTH_SECRET
# Make sure it's at least 32 characters
```

### "E2B sandbox creation fails"
- Check your E2B API key is correct
- Verify you have available quota at https://e2b.dev/dashboard

## What You Get

- **Authentication**: Secure user sign-up/sign-in
- **Project Management**: Create unlimited Next.js projects
- **Live Editor**: Monaco editor (VS Code-like)
- **Live Preview**: Real-time iframe preview
- **E2B Sandboxes**: Each project runs in isolation
- **Global CDN**: Deployed on Cloudflare's edge network

## Next Steps

1. **Add a custom domain** (optional)
2. **Explore the code** - all source in `src/`
3. **Customize the UI** - edit components in `src/components/`
4. **Add features** - extend API routes in `src/app/api/`

## Need More Help?

📖 **Full Setup Guide**: See `CLOUDFLARE_SETUP.md` for detailed instructions

🔧 **Troubleshooting**: Check the "Common Issues" section in `CLOUDFLARE_SETUP.md`

📚 **Documentation**:
- Cloudflare: https://developers.cloudflare.com
- E2B: https://e2b.dev/docs
- Next.js: https://nextjs.org/docs

---

**Happy coding!** 🚀

Built with Next.js 15, Cloudflare Workers, D1, R2, E2B, and Better Auth.
