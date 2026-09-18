const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// 1. Limiter Umum (Mencegah Flooding & DDoS Ringan)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 permintaan per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan, silakan coba lagi nanti."
  }
});

// 2. Limiter Khusus Auth (Mencegah Brute Force Login/Signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan masuk, silakan coba lagi setelah 15 menit."
  }
});

// 3. Konfigurasi Helmet (Security Headers & Content Security Policy)
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      scriptSrcElem: ["'self'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// 4. Custom Middleware NoSQL Sanitizer (Menggantikan inline middleware di app.js)
const sanitizeInput = (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  helmetMiddleware,
  sanitizeInput
};