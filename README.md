# Kingshot Gear Gap Analyzer V2

PvP gear comparison, battle simulator, cost calculator, and self-improving formula engine for Kingshot.

## Architecture

```
kingshot-gear-analyzer/
├── app/
│   ├── layout.js                    # Root layout (fonts, global styles)
│   ├── page.js                      # Main page → renders KingshotApp component
│   └── api/
│       ├── battle-reports/route.js  # POST: submit reports | GET: admin read
│       ├── gear-configs/route.js    # POST: save configs  | GET: admin read
│       ├── formula-config/route.js  # GET: public formula coefficients
│       └── admin/route.js           # GET: admin data viewer (passphrase-protected)
├── components/
│   └── KingshotApp.js               # Full React frontend (client component)
├── lib/
│   └── supabase-server.js           # Server-only Supabase clients
├── .env.example                     # Template for environment variables
├── .gitignore
├── next.config.js
├── package.json
└── vercel.json
```

**Security model:**
- All database writes go through server-side API routes
- `SUPABASE_SERVICE_ROLE_KEY` stays on the server (Vercel env vars)
- Frontend contains ZERO credentials
- Admin passphrase validated server-side
- No Supabase SDK shipped to the client

## Battle Formula

Based on Daryl/GDKPS (kingshotguides.com) validated formula (~95-100% accuracy):

```
Kills = √(Troops × ArmyMin) × (ATK × Leth) / (DEF × HP) × SkillMod
```

Key properties:
- **ATK × Leth** multiplicative in numerator
- **DEF × HP** divisive in denominator (NOT subtractive)
- **√(Troops × ArmyMin)** geometric mean army scaling
- Calibrated exponents loaded from `formula_config` table on page load
- Auto-calibration via Supabase Edge Function on actual result submissions

## Deployment

### Step 1: Push to GitHub

```bash
# Option A: Fresh clone
git clone https://github.com/YOUR_USER/kingshot-gear-analyzer.git
cd kingshot-gear-analyzer
rm -rf *
# Extract zip contents here
git add -A
git commit -m "feat: Next.js rebuild with server-side API routes"
git push origin main

# Option B: If starting fresh
mkdir kingshot-gear-analyzer && cd kingshot-gear-analyzer
git init
# Extract zip contents here
git add -A
git commit -m "initial: Next.js project with Supabase backend"
git remote add origin https://github.com/YOUR_USER/kingshot-gear-analyzer.git
git push -u origin main
```

### Step 2: Set Vercel Environment Variables

Go to **Vercel Dashboard → your project → Settings → Environment Variables**

Add these 4 variables (all environments: Production, Preview, Development):

| Variable | Value | Where to find it |
|----------|-------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Dashboard → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (secret!) | Supabase Dashboard → Settings → API → service_role |
| `ADMIN_PASSPHRASE` | your passphrase | You choose this |

### Step 3: Connect GitHub to Vercel

If not already connected:
1. Go to Vercel Dashboard → Import Project
2. Select your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Deploy

Vercel will auto-deploy on every push to `main`.

### Step 4: Verify

After deployment, check:
- `https://your-app.vercel.app/` — App loads
- `https://your-app.vercel.app/api/formula-config` — Returns JSON coefficients
- `https://your-app.vercel.app/api/admin?table=formula_config&admin_key=YOUR_KEY` — Returns admin data

## Supabase Backend

### Existing Tables (no changes needed)
- `battle_reports` — Battle data + actual results for calibration
- `gear_configs` — Saved gear configurations
- `formula_config` — Auto-calibrated formula coefficients

### Edge Function
- `auto-calibrate` — Triggered on new `actual_result` INSERT, adjusts formula weights

### Trigger
- `on_actual_result_inserted` — Fires Edge Function via `net.http_post`

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with actual keys
npm run dev
# Open http://localhost:3000
```

## Tech Stack

- **Frontend:** React 18 (client component), rendered by Next.js
- **Backend:** Next.js 15+ API Routes (Vercel serverless functions)
- **Database:** Supabase PostgreSQL + Edge Functions
- **Deployment:** Vercel (auto-deploy from GitHub)
- **Fonts:** Oxanium + IBM Plex Mono
