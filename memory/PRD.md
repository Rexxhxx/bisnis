# PRD — Quick Order (QO) Virtual Number Store

## Original Problem Statement
E-commerce sederhana untuk menjual virtual number (brand "Quick Order / QO") dengan pembayaran manual (tanpa payment gateway). Fitur: autentikasi (login/register + CAPTCHA), katalog 3 produk, cart, checkout, invoice/struk, pembayaran manual (DANA/BRI/QRIS), kirim bukti transfer via WhatsApp, konfirmasi admin (approve/reject), riwayat pembelian, struk cetak, manajemen produk/user/pengaturan. Tema putih-hijau + dark mode.

## Architecture
- Backend: FastAPI (Python), all routes under `/api`, JWT Bearer auth (localStorage `qo_token`), bcrypt hashing.
- Frontend: React 19 + React Router 7 + Tailwind + shadcn/ui + sonner + next-themes.
- DB: MongoDB (motor). Collections: users, products, carts, orders, settings, counters.
- Login identifier = **username** (not email). Roles: user, admin.

## User Personas
- User: mendaftar, membeli virtual number, transfer manual, kirim bukti, cek riwayat.
- Admin/Owner (founderrqo): kelola produk, konfirmasi pembayaran, kelola user & pengaturan.

## Core Requirements (static)
- Unique username/email/phone, password >= 8, CAPTCHA valid before register.
- Order lifecycle: Waiting Payment -> Waiting Admin Confirmation -> Completed / Payment Rejected.
- Sequential invoice numbers (INV-000001...).
- Manual payment info & website settings fully editable by admin.

## Implemented (2026-06)
- Auth (register/login/me/logout), JWT + bcrypt, admin seeding.
- 3 seeded products, product CRUD (admin).
- Cart (add/remove), checkout -> invoice, confirm-payment.
- Invoice/receipt page with DANA/BRI/QRIS, WhatsApp send-proof, Done button, print/PDF.
- Admin: dashboard stats, orders, payments (approve/reject+reason), users (role/suspend/reset/delete), settings.
- Purchase history, white-green theme + dark toggle, responsive, sonner notifications, empty/loading states.
- E2E tested: 13/13 backend, all frontend flows PASS.

### Iteration 2 (2026-06)
- In-app notifications (bell + panel) auto-created on admin approve (success) / reject (error).
- Product & QRIS/logo image upload via Emergent Object Storage (`/api/upload`, public `/api/files/{path}`).
- Admin revenue/traffic analytics page with daily/monthly/yearly charts (recharts).
- Admin can Approve/Reject orders in `Waiting Payment` state too.
- E2E tested: 21/21 backend, all frontend flows PASS (100%).

## Known Notes
- User-provided MongoDB Atlas URL failed auth (`bad auth`) twice. Currently using platform-local MongoDB. To switch to Atlas, put a VALID connection string in `backend/.env` MONGO_URL (see DEPLOYMENT.md section 0).
- Uploaded image URLs are stored absolute using REACT_APP_BACKEND_URL; fresh deploy uses the new backend URL for new uploads.

## Backlog (P1/P2)
- P1: Real image upload for products/QRIS (currently URL-based).
- P2: Email/WhatsApp notification on approve/reject; brute-force lockout; token revocation on password reset.
- P2: Order pagination/filters in admin; product categories UI.
