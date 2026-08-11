const User = require('../models/user');
const { sendToTokens } = require('../config/firebase');

// ================ Register FCM token ================
exports.registerFcmToken = async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const existing = (user.fcmTokens || []).find((t) => t.token === token);
    if (existing) {
      existing.platform = platform;
      existing.updatedAt = new Date();
    } else {
      user.fcmTokens = user.fcmTokens || [];
      user.fcmTokens.push({
        token,
        platform,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Cap tokens per user (multiple browsers / devices)
    if (user.fcmTokens.length > 20) {
      user.fcmTokens = user.fcmTokens.slice(-20);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'FCM token registered',
    });
  } catch (error) {
    console.error('[registerFcmToken]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register FCM token',
      error: error.message,
    });
  }
};

// ================ Unregister FCM token ================
exports.unregisterFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: { token } },
    });

    return res.status(200).json({
      success: true,
      message: 'FCM token removed',
    });
  } catch (error) {
    console.error('[unregisterFcmToken]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unregister FCM token',
      error: error.message,
    });
  }
};

async function pruneInvalidTokens(invalidTokens) {
  if (!invalidTokens?.length) return;
  await User.updateMany(
    { 'fcmTokens.token': { $in: invalidTokens } },
    { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
  );
}

/**
 * Helper for other controllers: push to a single user by id.
 */
exports.sendPushToUser = async (userId, payload) => {
  const user = await User.findById(userId).select('fcmTokens');
  if (!user?.fcmTokens?.length) {
    return { successCount: 0, failureCount: 0, skipped: true };
  }

  const tokens = user.fcmTokens.map((t) => t.token);
  const result = await sendToTokens(tokens, payload);
  await pruneInvalidTokens(result.invalidTokens);
  return result;
};

// ================ Admin / Instructor: send notification ================
exports.sendNotification = async (req, res) => {
  try {
    const { title, body, userId, userIds, broadcast, data, link, email } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'title and body are required',
      });
    }

    let usersQuery = null;

    if (broadcast) {
      usersQuery = { 'fcmTokens.0': { $exists: true } };
    } else if (Array.isArray(userIds) && userIds.length > 0) {
      usersQuery = { _id: { $in: userIds } };
    } else if (userId) {
      usersQuery = { _id: userId };
    } else if (email && typeof email === 'string' && email.trim()) {
      const normalized = email.trim();
      usersQuery = {
        email: { $regex: `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide email, userId, userIds, or set broadcast: true',
      });
    }

    const users = await User.find(usersQuery).select('fcmTokens email');

    if (!broadcast && email && users.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No user found with email: ${email.trim()}`,
      });
    }

    const tokens = users.flatMap((u) => (u.fcmTokens || []).map((t) => t.token));

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: email
          ? 'User found but has no registered push devices'
          : 'No FCM tokens found for the selected users',
        successCount: 0,
        failureCount: 0,
      });
    }

    const result = await sendToTokens(tokens, { title, body, data, link });
    await pruneInvalidTokens(result.invalidTokens);

    return res.status(200).json({
      success: true,
      message: 'Notification dispatched',
      successCount: result.successCount,
      failureCount: result.failureCount,
      prunedTokens: result.invalidTokens.length,
    });
  } catch (error) {
    console.error('[sendNotification]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send notification',
    });
  }
};
