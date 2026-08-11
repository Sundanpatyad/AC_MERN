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

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */

// 🔥 IMPORTANT: increase payload limits (DigitalOcean App Platform)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use(cookieParser());

// CORS — website + local Vite + mobile (native apps often send no Origin)
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://awakeningclasses.in',
  'http://awakeningclasses.in',
  'https://www.awakeningclasses.in',
  'http://www.awakeningclasses.in',
  'https://awakeningclasses.vercel.app',
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // Mobile apps / Postman / server-to-server: no Origin header
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

// File uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp',
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
}));

/* =========================
   DATABASE & SERVICES
========================= */

connectDB();
cloudinaryConnect();

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

/* =========================
   HEALTH / DEFAULT ROUTE
========================= */

app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="font-family: Arial">
      <h2>Server is running 🚀</h2>
      <p>Everything is OK</p>
    </div>
  `);
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on port ${PORT}`);
});
