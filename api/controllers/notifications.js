const User = require('../models/user');
const { sendToTokens } = require('../config/firebase');

const DEFAULT_PREFS = {
  pushEnabled: true,
  testReminders: true,
  rankUpdates: true,
  promotions: false,
};

const CATEGORY_PREF_KEY = {
  general: null, // only requires pushEnabled
  testReminders: 'testReminders',
  rankUpdates: 'rankUpdates',
  promotions: 'promotions',
};

function normalizePrefs(raw = {}) {
  return {
    pushEnabled: raw.pushEnabled !== false,
    testReminders: raw.testReminders !== false,
    rankUpdates: raw.rankUpdates !== false,
    promotions: raw.promotions === true,
  };
}

function userAllowsCategory(user, category = 'general') {
  const prefs = normalizePrefs(user.notificationPrefs);
  if (!prefs.pushEnabled) return false;
  const key = CATEGORY_PREF_KEY[category];
  if (!key) return true; // general
  return prefs[key] === true;
}

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

// ================ Get / update notification preferences ================
exports.getNotificationPrefs = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('notificationPrefs');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: normalizePrefs(user.notificationPrefs || DEFAULT_PREFS),
    });
  } catch (error) {
    console.error('[getNotificationPrefs]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load notification preferences',
    });
  }
};

exports.updateNotificationPrefs = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { pushEnabled, testReminders, rankUpdates, promotions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const current = normalizePrefs(user.notificationPrefs);
    const next = {
      pushEnabled:
        typeof pushEnabled === 'boolean' ? pushEnabled : current.pushEnabled,
      testReminders:
        typeof testReminders === 'boolean' ? testReminders : current.testReminders,
      rankUpdates:
        typeof rankUpdates === 'boolean' ? rankUpdates : current.rankUpdates,
      promotions:
        typeof promotions === 'boolean' ? promotions : current.promotions,
    };

    // Master off disables all categories
    if (!next.pushEnabled) {
      next.testReminders = false;
      next.rankUpdates = false;
      next.promotions = false;
    }

    user.notificationPrefs = next;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: next,
    });
  } catch (error) {
    console.error('[updateNotificationPrefs]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
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
 * Helper for other controllers: push to a single user by id + category.
 */
exports.sendPushToUser = async (userId, payload) => {
  const category = payload?.category || 'general';
  const user = await User.findById(userId).select('fcmTokens notificationPrefs');
  if (!user?.fcmTokens?.length) {
    return { successCount: 0, failureCount: 0, skipped: true };
  }
  if (!userAllowsCategory(user, category)) {
    return { successCount: 0, failureCount: 0, skipped: true, reason: 'prefs' };
  }

  const tokens = user.fcmTokens.map((t) => t.token);
  const result = await sendToTokens(tokens, {
    ...payload,
    data: { ...(payload.data || {}), category },
  });
  await pruneInvalidTokens(result.invalidTokens);
  return result;
};

// ================ Admin / Instructor: send notification ================
exports.sendNotification = async (req, res) => {
  try {
    const {
      title,
      body,
      userId,
      userIds,
      broadcast,
      data,
      link,
      email,
      category = 'general',
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'title and body are required',
      });
    }

    if (!Object.prototype.hasOwnProperty.call(CATEGORY_PREF_KEY, category)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid category. Use general, testReminders, rankUpdates, or promotions',
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
        email: {
          $regex: `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          $options: 'i',
        },
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide email, userId, userIds, or set broadcast: true',
      });
    }

    const users = await User.find(usersQuery).select(
      'fcmTokens email notificationPrefs'
    );

    if (!broadcast && email && users.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No user found with email: ${email.trim()}`,
      });
    }

    const eligible = users.filter((u) => userAllowsCategory(u, category));
    const tokens = eligible.flatMap((u) =>
      (u.fcmTokens || []).map((t) => t.token)
    );

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: email
          ? 'User found but has no eligible push devices for this category'
          : 'No eligible FCM tokens for this notification type',
        successCount: 0,
        failureCount: 0,
        skippedByPrefs: users.length - eligible.length,
      });
    }

    const result = await sendToTokens(tokens, {
      title,
      body,
      data: { ...(data || {}), category },
      link,
    });
    await pruneInvalidTokens(result.invalidTokens);

    return res.status(200).json({
      success: true,
      message: 'Notification dispatched',
      category,
      successCount: result.successCount,
      failureCount: result.failureCount,
      prunedTokens: result.invalidTokens.length,
      skippedByPrefs: users.length - eligible.length,
    });
  } catch (error) {
    console.error('[sendNotification]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send notification',
    });
  }
};
