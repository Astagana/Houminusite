# Houminusite

## Menjalankan aplikasi

Jalankan aplikasi melalui server agar akun tersimpan bersama dan bisa digunakan dari browser atau perangkat lain:

```bash
npm start
```

Buka `http://localhost:3000`. Data akun disimpan di `data/users.json`, sedangkan kata sandi disimpan dalam bentuk hash.

## Deploy ke Vercel

Repository ini sudah memiliki `api/index.js` dan `vercel.json`, sehingga Vercel dapat menjalankan server sebagai function. Cukup import repository ke Vercel lalu deploy.

Catatan: filesystem Vercel bersifat sementara. `data/users.json` cocok untuk demo, tetapi akun dapat hilang saat function dibuat ulang. Untuk data produksi, pindahkan penyimpanan pengguna ke database eksternal seperti Neon, Supabase, atau MongoDB Atlas, lalu gunakan connection string melalui Environment Variables Vercel.