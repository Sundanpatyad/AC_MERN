const express = require('express');
const path = require("path");
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const schedule = require('node-schedule');
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

// CORS (safe for prod + auth)
app.use(cors({
  origin: true,
  credentials: true,
}));

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
   CRON JOBS
========================= */

// Standard cron job that runs exactly every 30 seconds:
schedule.scheduleJob('*/30 * * * * *', () => {
  console.log('✅ Cron job executed (every 30 seconds)');
});

// If you meant an exponentially increasing interval (30s, 60s, 120s, etc.), you can use this instead:
/*
let intervalDelay = 30000; // Starts at 30 seconds
const runExponentialJob = () => {
  console.log(`✅ Exponential job executed. Next run in ${(intervalDelay * 2) / 1000} seconds`);
  intervalDelay *= 2; // Multiply by 2 for exponential backoff
  setTimeout(runExponentialJob, intervalDelay);
};
setTimeout(runExponentialJob, intervalDelay);
*/

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on port ${PORT}`);
});
