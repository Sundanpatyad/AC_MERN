const express = require('express');
const router = express.Router();

const { auth, isAdminOrInstructor } = require('../middleware/auth');
const {
  registerFcmToken,
  unregisterFcmToken,
  sendNotification,
  getNotificationPrefs,
  updateNotificationPrefs,
} = require('../controllers/notifications');

// Logged-in users register / remove their device tokens
router.post('/register', auth, registerFcmToken);
router.delete('/unregister', auth, unregisterFcmToken);

// Notification category preferences (app + web settings)
router.get('/prefs', auth, getNotificationPrefs);
router.put('/prefs', auth, updateNotificationPrefs);

// Instructor or Admin can send push notifications
router.post('/send', auth, isAdminOrInstructor, sendNotification);

module.exports = router;
