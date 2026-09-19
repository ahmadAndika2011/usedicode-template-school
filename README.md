# SMA Nusantara — Website Sekolah

Website profil SMA Nusantara: halaman beranda, asisten AI, dan pendaftaran akun dengan Google.

> **Status: dalam pengembangan.** README ini bersifat sementara dan akan diperbarui.

## Fitur

- **Halaman beranda** dengan hero parallax, statistik animasi, berita, dan tampilan responsif
- **Pendaftaran akun (SignUp)** dengan verifikasi Google, lalu melengkapi username, password, dan ID Siswa (opsional)
- **Login dengan Google** untuk akun yang sudah terdaftar
- **Asisten AI** (chat) yang terhubung ke Groq
- **Sesi login** disimpan di MongoDB
- **Keamanan dasar:** Helmet (CSP), rate limiting, sanitasi input NoSQL, password di-hash dengan bcrypt

## Teknologi

| Bagian | Yang dipakai |
| --- | --- |
| Server | Node.js, Express |
| Tampilan | EJS, HTML, CSS, JavaScript |
| Database | MongoDB + Mongoose |
| Sesi | express-session + connect-mongo |
| Autentikasi | Google Identity Services, google-auth-library, bcryptjs |
| AI | Groq API |
| Keamanan | helmet, express-rate-limit, sanitasi NoSQL |

## Struktur Folder

```
school/
├── config/            # koneksi database (db.js)
├── controllers/       # logika: auth, ai-chat, home
├── middleware/        # session, security, check-auth, check-role, upload-image
├── models/            # skema Mongoose (User.js)
├── public/
│   ├── css/           # auth, cursor, footer, header, home
│   ├── js/            # auth, cursor, home
│   └── uploads/       # file unggahan
├── routes/            # auth, ai-chat, home, login, signup
├── utils/             # async-handler.js
├── views/
│   ├── partials/      # header.ejs, footer.ejs
│   └── home.ejs
├── .env               # rahasia, JANGAN di-commit
├── package.json
└── server.js
```

## Menjalankan di Komputer Sendiri

**Prasyarat:** Node.js 18 atau lebih baru, dan MongoDB (lokal atau MongoDB Atlas).

```bash
# 1. Clone dan masuk ke folder
git clone <url-repo-kamu>
cd school

# 2. Install dependensi
npm install

# 3. Buat file .env (lihat contoh di bawah)

# 4. Jalankan server
node server.js
```

Buka **http://localhost:3000**.

### Contoh `.env`

```env
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/school
SESSION_SECRET=isi_string_acak_panjang
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
```

Membuat `SESSION_SECRET`: jalankan `openssl rand -hex 32`.

## Menyiapkan Login Google

1. Buka [Google Cloud Console](https://console.cloud.google.com), lalu **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
2. Isi **Authorized JavaScript origins**:
   - `http://localhost`
   - `http://localhost:3000`
   - domain asli saat produksi (`https://...`)
3. Salin Client ID ke `.env` (`GOOGLE_CLIENT_ID`) **dan** ke konstanta `GOOGLE_CLIENT_ID` di `public/js/auth.js`.
4. Selama OAuth consent screen berstatus *Testing*, hanya akun yang terdaftar sebagai *Test users* yang bisa masuk.

## Alur Pendaftaran

1. Pengguna klik **SignUp** di header, lalu modal terbuka.
2. Verifikasi dengan akun Google.
3. Jika akun belum terdaftar, muncul form: **username**, **password**, dan **ID Siswa** (opsional).
4. Data disimpan ke koleksi `users`, dan pengguna otomatis login.

Jika akun Google sudah terdaftar, pengguna langsung login (langkah 3 dilewati).

## Endpoint Auth

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `POST` | `/api/auth/google` | Verifikasi token Google; login atau minta lengkapi data |
| `POST` | `/api/auth/complete-signup` | Simpan username, password, dan ID Siswa (opsional) |
| `GET` | `/api/auth/me` | Cek sesi login saat ini |
| `POST` | `/api/auth/logout` | Keluar dan hapus sesi |

Endpoint chat AI ada di `routes/ai-chat.js`.

## Catatan Produksi

- Ubah `secure` menjadi `true` pada cookie di `middleware/session.js` (wajib HTTPS).
- Jika di belakang proxy (Nginx, Cloudflare, dsb.), tambahkan `app.set('trust proxy', 1)`.
- Tambahkan domain produksi di Authorized JavaScript origins Google.
- Pastikan `.env` masuk `.gitignore` dan tidak pernah di-commit.

## Rencana / Belum Selesai

- [ ] Login username + password (`routes/login.js`) dengan `bcrypt.compare`
- [ ] Peran pengguna (siswa, guru, admin) dan penggunaan `check-role`
- [ ] Menautkan `id_siswa` ke data siswa
- [ ] Isi `SYSTEM_PROMPT` asisten AI dengan informasi sekolah yang lengkap
- [ ] Halaman lain (tentang, fasilitas, ekstrakurikuler, guru, berita)
- [ ] Deploy ke hosting

## Lisensi

Belum ditentukan.
