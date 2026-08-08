# 🔑 HOW TO GET PRODUCTION DATABASE_URL

## Step 1: Go to Render Dashboard
https://render.com/dashboard

## Step 2: Find Your PostgreSQL Database
Look for:
- Service name ending with `-postgres` or `-db`
- OR check which database `commerceflow-api` is using

## Step 3: Get Connection String
1. Click on the PostgreSQL service
2. Go to **"Connect"** tab OR **"Info"** section
3. Copy **"External Database URL"** or **"Internal Database URL"**

Should look like:
```
postgresql://username:password@host.render.com/dbname
```

## Step 4: Use It Locally

### **Method A: Environment Variable (Temporary)**
```powershell
# PowerShell (Windows)
$env:DATABASE_URL="postgresql://username:password@host/db"
npx tsx prisma/seed.ts
```

### **Method B: .env.production File**
1. Create `backend/.env.production`
2. Add: `DATABASE_URL=postgresql://...`
3. Run: 
   ```powershell
   # Load production env
   Get-Content .env.production | ForEach-Object {
     if($_ -match "^([^=]+)=(.*)$") {
       [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
     }
   }
   npx tsx prisma/seed.ts
   ```

---

## ⚠️ EASIER WAY: Use Render Shell

Instead of local, just use Render Shell:
1. https://render.com/dashboard
2. Click: `commerceflow-api`
3. Click: **Shell** (top right)
4. Run:
   ```bash
   cd backend
   npx tsx prisma/seed.ts
   ```

Database URL already set in Render environment!

---

## 🔍 Find DATABASE_URL in Render

**Option 1: From API Service**
```
Render → commerceflow-api → Environment
Look for: DATABASE_URL
```

**Option 2: From Postgres Service**
```
Render → [Your Postgres Service] → Connect
Copy: External Database URL
```

**Option 3: From Shell**
```
Render → commerceflow-api → Shell
echo $DATABASE_URL
```

---

## ✅ RECOMMENDED APPROACH:

**Just use Render Shell!** It's simpler and safer:

```bash
# No need to get DATABASE_URL
# No need to set environment variables
# Just run in Render Shell:

cd backend
npx tsx prisma/seed.ts
```

Done! ✅
