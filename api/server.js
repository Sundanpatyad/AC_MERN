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
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors({ origin: '*' }));

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
