const express = require('express');
const router = express.Router();

const { auth, isAdmin, isAdminOrInstructor } = require('../middleware/auth');
const {
  registerFcmToken,
  unregisterFcmToken,
  sendNotification,
} = require('../controllers/notifications');

// Logged-in users register / remove their device tokens
router.post('/register', auth, registerFcmToken);
router.delete('/unregister', auth, unregisterFcmToken);

// Instructor or Admin can send push notifications
router.post('/send', auth, isAdminOrInstructor, sendNotification);

module.exports = router;
