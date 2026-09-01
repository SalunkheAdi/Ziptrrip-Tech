# Deployment Guide — ZipTrap Todo App

This guide covers deploying the app using:
- **Frontend** → [Vercel](https://vercel.com) (free)
- **Backend** → [Render](https://render.com) (free)
- **Database** → [Neon](https://neon.tech) (free PostgreSQL cloud)

---

## Step 1 — Set Up PostgreSQL on Neon (Free Cloud DB)

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click **New Project** → name it `ziptrap`
3. Once created, go to **Dashboard → Connection Details**
4. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Open the **SQL Editor** tab in Neon and paste + run the contents of `backend/db/schema.sql`

---

## Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo: `SalunkheAdi/Ziptrrip-Tech`
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Scroll to **Environment Variables** and add these:

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | `ep-xxxx.us-east-1.aws.neon.tech` (from Neon) |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `neondb` (or your Neon DB name) |
   | `DB_USER` | your Neon username |
   | `DB_PASSWORD` | your Neon password |
   | `CLIENT_URL` | *(leave empty for now, fill after Vercel deploy)* |
   | `NODE_ENV` | `production` |

   > **Tip:** If using Neon connection string, you can also just set a single `DATABASE_URL` — but the current setup uses individual fields.

6. Click **Deploy** → wait ~2 minutes
7. Copy your backend URL — looks like: `https://ziptrap-backend.onrender.com`

---

## Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **New Project → Import** your repo: `SalunkheAdi/Ziptrrip-Tech`
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App (auto-detected)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `build` (auto)
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://ziptrap-backend.onrender.com` |

5. Click **Deploy** → wait ~1 minute
6. Copy your frontend URL — looks like: `https://ziptrap-todo.vercel.app`

---

## Step 4 — Update CORS on Render

1. Go back to **Render → your backend service → Environment**
2. Add/update:

   | Key | Value |
   |-----|-------|
   | `CLIENT_URL` | `https://ziptrap-todo.vercel.app` |

3. Render will **auto-redeploy** with updated CORS settings

---

## ✅ Done! Test Your Deployment

1. Open your Vercel URL in browser
2. Try creating, editing, deleting todos
3. Click on a todo to go to the detail page (`/todo?id=1`)
4. Check the backend health: `https://ziptrap-backend.onrender.com/api/health`

---

## 🔧 Local Development (for reference)

```bash
# Terminal 1 — Backend
cd backend
npm run dev          # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start            # runs on http://localhost:3000
                     # proxy auto-routes API calls to :5000
```

---

## ⚠️ Notes

- Render free tier **spins down after 15 min of inactivity** — first request after idle may take 30–60 seconds to wake up. This is normal on the free plan.
- Never commit your `.env` file — it's in `.gitignore` already
- Neon free tier has 3GB storage — more than enough for this app
