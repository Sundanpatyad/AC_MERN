const express = require('express');
const path = require("path");
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const mockRoutes = require("./routes/mocktest");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const materialRoutes = require('./routes/studyMaterialsRoutes');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');
const usageRoutes = require('./routes/appUsage');
const pdfRoutes = require('./routes/pdfMaterial');
const youtubeRoutes = require('./routes/youtube');
const { initFirebaseAdmin } = require('./config/firebase');

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */

// Razorpay signs the raw webhook bytes — this must run before express.json().
app.use('/api/v1/payment/webhook', express.raw({ type: () => true, limit: '1mb' }));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use(cookieParser());

// Allow all origins
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-AC-Viewer'],
  })
);
app.options('*', cors({ origin: '*' }));

// File uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp',
  limits: {
    fileSize: 40 * 1024 * 1024, // 40 MB — study PDFs
  },
}));

/* =========================
   DATABASE & SERVICES
========================= */

connectDB();
cloudinaryConnect();
initFirebaseAdmin();

/* =========================
   ROUTES
========================= */

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/mock', mockRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/usage', usageRoutes);
app.use('/api/v1/pdfs', pdfRoutes);
app.use('/api/v1/youtube', youtubeRoutes);

/* =========================
   HEALTH / DEFAULT ROUTE
========================= */

app.get('/', (req, res) => {
  res.status(200).type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Awakening Classes API</title>
  <style>
    :root {
      --bg: #0c0b08;
      --fg: #f3efe6;
      --muted: #9a9285;
      --line: rgba(243, 239, 230, 0.12);
      --ok: #7dcea0;
      --surface: #16140f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "Segoe UI", system-ui, sans-serif;
      background:
        radial-gradient(ellipse at 20% 0%, rgba(180, 60, 50, 0.18), transparent 45%),
        radial-gradient(ellipse at 80% 100%, rgba(243, 239, 230, 0.06), transparent 40%),
        var(--bg);
      color: var(--fg);
    }
    main {
      width: min(92vw, 420px);
      padding: 2rem 1.75rem;
      border: 1px solid var(--line);
      border-radius: 1.25rem;
      background: var(--surface);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 999px;
      background: #c0392b;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.02em;
    }
    .brand h1 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .brand p {
      margin: 0.15rem 0 0;
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.16em;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.75rem;
      font-size: 1.15rem;
      font-weight: 600;
    }
    .dot {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 999px;
      background: var(--ok);
      box-shadow: 0 0 0 4px rgba(125, 206, 160, 0.15);
    }
    .copy {
      margin: 0;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.5;
    }
    .meta {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--line);
      font-size: 0.75rem;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
  </style>
</head>
<body>
  <main>
    <div class="brand">
      <div class="logo">AC</div>
      <div>
        <h1>Awakening Classes</h1>
        <p>API server</p>
      </div>
    </div>
    <div class="status"><span class="dot" aria-hidden="true"></span> Online</div>
    <p class="copy">This is the Awakening Classes backend. Mock tests, study material, and app services are available through the API.</p>
    <div class="meta">
      <span>Health check</span>
      <span>${new Date().toISOString()}</span>
    </div>
  </main>
</body>
</html>`);
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on port ${PORT}`);
});
