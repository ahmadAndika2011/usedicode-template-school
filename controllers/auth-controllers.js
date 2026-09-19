const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SESSION_COOKIE = 'school_session';   // harus sama dengan `name` di middleware/session.js
const PENDING_TTL = 10 * 60 * 1000;        // 10 menit untuk menyelesaikan form

const regenerate = (req) =>
  new Promise((resolve, reject) => req.session.regenerate((e) => (e ? reject(e) : resolve())));

const toSessionUser = (u) => ({
  id: u._id.toString(),
  username: u.username,
  name: u.name,
  email: u.email,
  picture: u.picture,
});

// POST /api/auth/google — langkah 1
module.exports.authGoogle = async (req, res) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p.email_verified) {
      return res.status(401).json({ error: 'Email Google belum terverifikasi' });
    }

    // Sudah terdaftar → login
    const existing = await User.findOne({ googleId: p.sub });
    if (existing) {
      await regenerate(req);
      req.session.user = toSessionUser(existing);
      return res.json({ status: 'login', user: req.session.user });
    }

    // Belum terdaftar → simpan data Google sementara di SERVER, minta form
    req.session.pendingGoogle = {
      googleId: p.sub,
      email: p.email,
      name: p.name,
      picture: p.picture,
      at: Date.now(),
    };
    res.json({ status: 'need_profile', name: p.name });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Verifikasi Google gagal. Silakan coba lagi.' });
  }
};

// POST /api/auth/complete-signup — langkah 2
module.exports.authCompleteSignup = async (req, res) => {
  try {
    const pending = req.session.pendingGoogle;
    if (!pending || Date.now() - pending.at > PENDING_TTL) {
      return res.status(400).json({ error: 'Sesi pendaftaran habis. Silakan verifikasi Google lagi.' });
    }

    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const idSiswa = String(req.body.id_siswa || '').trim();

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username harus 3–30 karakter' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Password harus 8–72 karakter' });
    }
    // ID Siswa opsional: kalau diisi, harus berupa ObjectId (24 karakter hex)
    if (idSiswa && !/^[a-f\d]{24}$/i.test(idSiswa)) {
      return res.status(400).json({ error: 'Format ID Siswa tidak valid' });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ error: 'Username sudah dipakai' });
    }

    const data = {
      username,
      password: await bcrypt.hash(password, 10),
      googleId: pending.googleId,
      email: pending.email,
      name: pending.name,
      picture: pending.picture,
    };
    if (idSiswa) data.id_siswa = idSiswa;

    const user = await User.create(data);

    await regenerate(req);                       // ID sesi baru; pendingGoogle ikut terhapus
    req.session.user = toSessionUser(user);
    res.status(201).json({ user: req.session.user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username atau akun Google ini sudah terdaftar' });
    }
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat akun' });
  }
};

// GET /api/auth/me
module.exports.authMe = (req, res) => {
  res.json({ user: req.session.user || null });
};

// POST /api/auth/logout
module.exports.authLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Gagal keluar' });
    }
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  });
};