# XINZZ GitHub Panel

Frontend panel statis untuk GitHub Pages.

## Demo login
Username: `admin`
Password: `admin123`

**Ganti kredensial sebelum dipakai sungguhan.** Login demo ini hanya untuk UI; keamanan sebenarnya harus dilakukan oleh backend.

## Deploy ke GitHub Pages
1. Buat repository baru.
2. Upload semua isi ZIP ini ke root repository.
3. Settings → Pages → Deploy from branch → `main` / root.
4. Buka URL Pages yang diberikan GitHub.

## Backend API
Panel mengharapkan:
- `GET /api/status` → `{online,cpu,ram,uptime,qr,logs}`
- `POST /api/control` body `{action:"start"|"stop"|"restart"}`

Masukkan URL backend pada menu **Backend**.

Catatan: GitHub Pages tidak menjalankan Node.js/XINZZ SC. SC tetap harus berjalan di VPS/server. QR frontend hanya menampilkan data QR yang dikirim backend; sistem QR SC tidak diubah oleh panel ini.
