# Deploy Shield Store (production)

Deploy the **React client** (static), **Express API** (Node), and **MongoDB Atlas** (database). Typical stack: **Vercel** + **Render** + **Atlas** (free tiers available).

### Free launch (single provider — Render Blueprint)

The repo root `render.yaml` defines **two free services**: `shield-api` (Node API in `/server`) and `shield-web` (static SPA from `/client`, with SPA rewrites).

1. Create [MongoDB Atlas](https://www.mongodb.com/atlas/database) **M0** cluster and URI (see §1 below).
2. Push the repo and open [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connect the repo → **Deploy Blueprint**. When prompted for **sync: false** variables, set **`MONGODB_URI`**. Optionally set SMTP / Google keys there too.
4. After both services show live URLs: open **`shield-api`** → **Environment** → set **`BACKEND_URL`** to this service’s HTTPS URL (`https://shield-api-xxxx.onrender.com`), and **`FRONTEND_URL`** to the **static site** URL (`https://shield-web-xxxx.onrender.com`). No trailing slashes. Save (API will restart).
5. Run **`npm run seed`** once against Atlas (localhost with `MONGODB_URI` in `server/.env`, or Render **Shell**) so products and admin exist.
6. If **`shield-web`** build failed before the API had a URL, trigger **Manual Deploy → Clear cache & deploy** on the static service.

`REACT_APP_API_URL` is wired from **`shield-api`’s `RENDER_EXTERNAL_URL`** so the SPA calls your API in production without Vercel.

## Prerequisites

- GitHub repo connected to Vercel and Render (or deploy from CLI).
- MongoDB Atlas cluster with a database user and **Network Access** `0.0.0.0/0` (or Render’s outbound IPs only if you prefer).

---

## 1. MongoDB Atlas

1. Create a project → **Build a Database** (M0 free).
2. **Database Access:** create user + strong password.
3. **Network Access:** add IP `0.0.0.0/0` (required for Render’s dynamic IPs).
4. **Connect** → copy connection string, replace `<password>` with your user password (URL-encode special characters, e.g. `@` → `%40`).

---

## 2. Backend (Render)

1. **New** → **Web Service** → connect repo.
2. **Root directory:** `server`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Environment variables:**

| Key | Example |
|-----|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/shieldstore?retryWrites=true&w=majority` |
| `JWT_SECRET` | Long random string (generate locally, never commit) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` (comma-separate multiple preview URLs if needed) |
| `PORT` | Leave unset (Render sets `PORT`) |
| `SMTP_SERVICE` | `gmail` (or leave blank if using host/port) |
| `SMTP_HOST` | SMTP host if not using service (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM` | Sender email shown to users |
| `SUPPORT_EMAIL` | Contact form recipient email |

6. Deploy. Note the service URL, e.g. `https://shieldstore.onrender.com`.

7. **Health check:** open `https://YOUR-RENDER-URL/api/health` → should return `{"status":"ok"}`.

8. **Seed (once):** locally or via Render shell, with `MONGODB_URI` and `JWT_SECRET` set:

   ```bash
   cd server && npm run seed
   ```

---

## 3. Frontend (Vercel)

1. **Import** project → **Root directory:** `client`
2. **Framework:** Create React App (auto-detected).
3. **Build command:** `npm run build`
4. **Output:** `build`
5. **Environment variables (Production + Preview):**

| Key | Value |
|-----|--------|
| `REACT_APP_API_URL` | `https://YOUR-RENDER-URL` — **no trailing slash** |

`REACT_APP_*` is baked in at **build time**. After changing env vars, **Redeploy** the Vercel project.

6. Optional: set `NODE_ENV` to `production` in Vercel (often default for Production).

---

## 4. Post-deploy checklist

- [ ] `GET https://YOUR-API/api/health` → `ok`
- [ ] `GET https://YOUR-API/api/products?limit=1` → JSON with products (after seed)
- [ ] Vercel site loads; browser **Network** tab shows API calls to your Render URL (not relative `/api` only)
- [ ] Admin: `https://YOUR-VERCEL/admin/login` — login after seed (`admin@shield.com` / `admin123` — **change password** in production)
- [ ] Google OAuth: set **Authorized redirect URIs** in Google Cloud to `https://YOUR-API/api/auth/google/callback` (or your configured callback path)
- [ ] Rotate any credentials that were ever committed to git

---

## 5. Local production build test

```bash
cd client
set REACT_APP_API_URL=http://localhost:5000   # Windows; use export on Mac/Linux
npm run build
npx serve -s build
```

Run the server on port 5000 and verify the static build talks to the API.

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty products on live site | Set `REACT_APP_API_URL` on Vercel **before** build; redeploy |
| CORS errors | Set `FRONTEND_URL` on Render to exact Vercel URL (https, no trailing slash). Multiple URLs: comma-separated |
| 502 on Render | Check logs; ensure `MONGODB_URI` correct and Atlas allows `0.0.0.0/0` |
| Login fails | Same API URL as client; JWT_SECRET set; DB seeded |

---

## Files in this repo

- `client/vercel.json` — SPA rewrites for React Router
- `server/.env.example` — copy to `server/.env` locally (never commit `.env`)
- `client/.env.example` — reference for `REACT_APP_API_URL`
