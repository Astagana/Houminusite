# Houminusite

## Menjalankan aplikasi

Jalankan aplikasi melalui server agar akun tersimpan bersama dan bisa digunakan dari browser atau perangkat lain:

```bash
npm start
```

Buka `http://localhost:3000`. Data akun disimpan di `data/users.json`, sedangkan kata sandi disimpan dalam bentuk hash. Saat dipasang online, jalankan server ini pada hosting yang memiliki penyimpanan persisten dan gunakan HTTPS.