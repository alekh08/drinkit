# Quick Start Guide (Frontend Only)

Since you don't have Razorpay configured yet, here's how to see the DRINKIT frontend:

## Option 1: Frontend Only (No Backend)

You can view the frontend UI by temporarily making the API calls optional:

```bash
cd frontend
npm run dev
```

Then visit: http://localhost:5173

**Note:** Login won't work without the backend, but you can see the UI design.

---

## Option 2: Full Setup (Recommended)

To actually use the app with login functionality:

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your postgres password

### Step 2: Install Redis
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Install `Redis-x64-3.0.504.msi`
3. Start Redis service

### Step 3: Setup Database
```bash
# Open Command Prompt as Administrator
psql -U postgres
# Enter your postgres password

# In PostgreSQL prompt:
CREATE DATABASE drinkit;
\c drinkit
\i C:\Users\alekh\OneDrive\Desktop\drinkit\database\schema.sql
\q
```

### Step 4: Update Backend .env
Edit `backend\.env` and update:
```
DB_PASSWORD=your_postgres_password
```

### Step 5: Start Backend
```bash
cd backend
npm run dev
```

Backend will start on: http://localhost:5000

### Step 6: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:5173

---

## Testing the App

### Login Flow:
1. Go to http://localhost:5173
2. Select role: **Customer** (USER)
3. Enter any 10-digit mobile: `9876543210`
4. Click "Send OTP"
5. Check backend console for OTP (6 digits)
6. Enter OTP and verify

### Test Different Roles:
- **Customer**: Browse stores, add to cart
- **Store**: Manage products, accept orders
- **Rider**: Accept deliveries, track orders
- **Admin**: Approve stores/riders, view analytics

### Admin Login:
- Mobile: `9999999999`
- Role: ADMIN
- (OTP shown in backend console)

---

## If You Get Errors:

**Database Connection Error:**
- Make sure PostgreSQL is running
- Check password in `backend\.env`
- Verify database `drinkit` exists

**Redis Connection Error:**
- Install and start Redis
- Or temporarily comment out Redis in `backend/src/config/redis.js`

**Payment Errors:**
- Ignore payment features for now
- They won't work without real Razorpay keys
- Other features work fine!

---

## Quick Commands

**Backend:**
```bash
cd C:\Users\alekh\OneDrive\Desktop\drinkit\backend
npm run dev
```

**Frontend:**
```bash
cd C:\Users\alekh\OneDrive\Desktop\drinkit\frontend
npm run dev
```

---

Need help with setup? Let me know which step you're stuck on!
