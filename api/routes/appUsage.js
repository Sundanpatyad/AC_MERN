const express = require('express');
const router = express.Router();

const { auth, isAdminOrInstructor } = require('../middleware/auth');
const {
  startSession,
  heartbeatSession,
  endSession,
  getAdminUsage,
} = require('../controllers/appUsage');

router.post('/session/start', auth, startSession);
router.post('/session/heartbeat', auth, heartbeatSession);
router.post('/session/end', auth, endSession);
router.get('/admin', auth, isAdminOrInstructor, getAdminUsage);

module.exports = router;
