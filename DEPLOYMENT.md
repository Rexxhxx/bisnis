# Panduan Deploy — Quick Order (QO)

Aplikasi ini terdiri dari 3 bagian: **backend (FastAPI/Python)**, **frontend (React)**, dan **MongoDB**.

---

## 0. Menggunakan MongoDB Atlas (PENTING)
URL Atlas yang Anda berikan **DITOLAK** oleh server (`bad auth : authentication failed`) — artinya username/password DB user-nya salah / sudah dihapus / di-reset. Koneksi ke cluster berhasil, hanya autentikasinya gagal.

Cara memperbaiki di Atlas:
1. Login ke https://cloud.mongodb.com
2. **Database Access** → buat/edit user (mis. `velyn_db`) → set password baru → Role: `Atlas admin` atau `readWrite`.
3. **Network Access** → Add IP → `0.0.0.0/0` (allow from anywhere) supaya server bisa connect.
4. **Database → Connect → Drivers** → salin connection string, contoh:
   `mongodb+srv://velyn_db:PASSWORD_BARU@cluster0.4v23n8r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
5. Masukkan ke `backend/.env`:
   ```
   MONGO_URL="mongodb+srv://velyn_db:PASSWORD_BARU@cluster0.4v23n8r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
   DB_NAME="quickorder"
   ```
   > Jika password mengandung karakter khusus (`@ : / ? # %`), URL-encode dulu (mis. `@` → `%40`).
6. Restart backend. Data akan otomatis ter-seed (admin + 3 produk + settings).

---

## 1. Deploy ke Server Lokal (development)
Prasyarat: Python 3.11+, Node 18+, Yarn, MongoDB (lokal atau Atlas).

Backend:
```bash
cd backend
pip install -r requirements.txt
# pastikan backend/.env berisi MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
Frontend:
```bash
cd frontend
yarn install
# set frontend/.env -> REACT_APP_BACKEND_URL=http://localhost:8001
yarn start   # jalan di http://localhost:3000
```
Login admin: `founderrqo` / `founderrqo123`.

---

## 2. Deploy ke VPS (production, rekomendasi untuk full-stack)
VPS paling cocok karena backend Python bersifat long-running (Vercel serverless kurang ideal untuk FastAPI + Mongo).

Contoh Ubuntu VPS:
```bash
# 1. Install dependencies
sudo apt update && sudo apt install -y python3-pip nodejs npm nginx
npm i -g yarn pm2 serve

# 2. Backend
cd /var/www/qo/backend
pip3 install -r requirements.txt
# jalankan dgn gunicorn/uvicorn via pm2
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name qo-backend

# 3. Frontend build
cd /var/www/qo/frontend
# set REACT_APP_BACKEND_URL=https://api.domainanda.com  (atau https://domainanda.com)
yarn install && yarn build
pm2 serve build 3000 --name qo-frontend --spa
```
Nginx reverse proxy (`/etc/nginx/sites-available/qo`):
```nginx
server {
    listen 80;
    server_name domainanda.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/qo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# HTTPS gratis:
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domainanda.com
```
Penting di VPS: `backend/.env` set `CORS_ORIGINS="https://domainanda.com"` dan `frontend/.env` set `REACT_APP_BACKEND_URL=https://domainanda.com`.

---

## 3. Deploy ke Vercel
Vercel ideal untuk **frontend**. Backend FastAPI sebaiknya dipisah.

**Opsi A (rekomendasi): Frontend di Vercel, Backend di VPS/Render/Railway.**
- Frontend di Vercel:
  - Root Directory: `frontend`
  - Build Command: `yarn build`, Output: `build`
  - Environment Variable: `REACT_APP_BACKEND_URL=https://backend-anda.com`
- Backend di Render/Railway:
  - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
  - Env: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGINS=https://app-vercel-anda.vercel.app`

**Opsi B: Backend juga di Vercel (Serverless).** Perlu file `api/index.py` + `vercel.json` dengan `@vercel/python`. Kurang disarankan karena cold-start & koneksi Mongo persisten. Jika mau, minta saya buatkan konfigurasinya.

---

## Checklist Anti-Error Saat Deploy
- [ ] `REACT_APP_BACKEND_URL` menunjuk ke URL backend yang benar (tanpa trailing slash).
- [ ] `CORS_ORIGINS` di backend berisi domain frontend (bukan `*` di production dengan credentials).
- [ ] MongoDB Network Access mengizinkan IP server (`0.0.0.0/0` untuk uji coba).
- [ ] `JWT_SECRET` diganti dengan string acak yang kuat di production.
- [ ] `ADMIN_PASSWORD` diganti dari default `founderrqo123`.
- [ ] Semua route backend berawalan `/api`.
