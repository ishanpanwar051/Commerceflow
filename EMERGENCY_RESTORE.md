# 🚨 EMERGENCY DATABASE RESTORE

**Problem:** Database cleared but seed failed  
**Status:** Products showing "No products found"  
**Solution:** Manual seed required

---

## 🔧 IMMEDIATE FIX (5 MINUTES):

### **Step 1: Open Render Shell**
1. Go to: https://render.com/dashboard
2. Click: `commerceflow-api` service
3. Click: **Shell** tab (top right)
4. Wait for shell to load (~30 seconds)

### **Step 2: Run These Commands**
Copy-paste each command one by one:

```bash
# Navigate to backend
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push --accept-data-loss

# Seed database with FIXED logic
npx tsx prisma/seed.ts
```

### **Step 3: Wait for Seed**
You'll see:
```
🌱 Seeding comprehensive product database...
Created 20 products with reviews...
Created 40 products with reviews...
...
Created 120 products with reviews...
✅ Seed complete!
```

### **Step 4: Restart Service**
1. Go back to Render dashboard
2. Click: **Manual Deploy** → **Deploy latest commit**
3. OR: Service will auto-restart after seed

### **Step 5: Verify**
1. Wait 2 minutes for restart
2. Open: https://commerceflow-frontend-5c7v.onrender.com
3. Hard reload: `Ctrl + Shift + R`
4. Check: Products should appear ✅

---

## 📋 ALTERNATIVE: One-Command Fix

If above doesn't work, try this single command:

```bash
cd backend && npx prisma generate && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts
```

---

## 🔍 VERIFY SEED SUCCESS:

### **In Render Shell:**
```bash
# Check product count
npx prisma studio

# OR use psql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
```

Should show: `120` products

### **Via API:**
```bash
curl "https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=3"
```

Should return: JSON with 3 products

---

## ❓ TROUBLESHOOTING:

### **"Command not found: npx"**
```bash
# Check node version
node --version

# Should be v24.x
# If not, restart shell
```

### **"DATABASE_URL not set"**
```bash
# Check environment variables
env | grep DATABASE

# If empty, set manually:
export DATABASE_URL="your-database-url-here"
```

### **"Error: P1001 Can't reach database"**
- Database might be sleeping (free tier)
- Wait 30 seconds and try again
- OR check DATABASE_URL in Render dashboard

### **Seed runs but products still empty**
```bash
# Check if products were created
npx prisma studio

# OR
psql $DATABASE_URL -c "SELECT id, name FROM products LIMIT 5;"
```

### **Seed fails with "out of memory"**
- Free tier has memory limit
- Try seeding with fewer products:
  - Edit `prisma/seed.ts`
  - Change `allProducts.length < 120` to `< 50`
  - Run seed again

---

## 🎯 EXPECTED RESULTS:

### **After Successful Seed:**

**Render Logs:**
```
🌱 Seeding comprehensive product database...
Created 120 products with reviews...
✅ Seed complete! Database contains:
   - 120 products
   - 17 categories
   - 185 subcategories
   - 4 test users
```

**Website:**
- Homepage shows products ✅
- Featured section has products ✅
- Bestsellers section has products ✅
- No "No products found" ❌

**API Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      { "id": "...", "name": "Galaxy S25 Ultra", ... },
      { "id": "...", "name": "iPhone 17 Pro Max", ... },
      ...
    ]
  }
}
```

---

## 🛡️ PREVENTION:

This happened because deploy-seed tried to auto-clear database but seed failed.

**Fixed in latest commit:**
- deploy-seed now only CHECKS (doesn't clear)
- Manual seed required for safety
- Emergency script provided for quick restore

---

## 📞 IF STILL NOT WORKING:

### **Option 1: Check Render Logs**
Look for errors in:
- Build logs
- Deploy logs
- Runtime logs

### **Option 2: Check Database Connection**
```bash
# In Render Shell
psql $DATABASE_URL -c "SELECT version();"
```

Should return PostgreSQL version

### **Option 3: Manual SQL Insert**
If seed completely fails, I can provide SQL INSERT statements for emergency data.

---

## ✅ SUCCESS CHECKLIST:

- [ ] Render Shell opened
- [ ] `cd backend` successful
- [ ] `npx prisma generate` successful  
- [ ] `npx prisma db push` successful
- [ ] `npx tsx prisma/seed.ts` completed (shows 120 products)
- [ ] Service restarted
- [ ] Website shows products
- [ ] API returns products
- [ ] No "No products found" error

---

**Current Status:** 🔴 **DATABASE EMPTY**  
**Action:** 🔧 **RUN MANUAL SEED NOW**  
**Time:** ⏱️ **5 minutes**

---

**Render Dashboard:** https://render.com/dashboard  
**Shell Tab:** Click service → Shell (top right)  
**Website:** https://commerceflow-frontend-5c7v.onrender.com
