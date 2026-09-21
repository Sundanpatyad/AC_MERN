const User = require('../models/user');
const AppUsageDay = require('../models/appUsageDay');

const IST = 'Asia/Kolkata';
const MAX_SESSIONS = 80;

const istDateKey = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const shiftDateKey = (dateKey, deltaDays) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + deltaDays));
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const closeOpenSessions = (doc, at = new Date()) => {
  let changed = false;
  for (const session of doc.sessions) {
    if (session.endedAt) continue;
    const end = session.lastHeartbeatAt && session.lastHeartbeatAt > session.startedAt
      ? session.lastHeartbeatAt
      : at;
    session.endedAt = end;
    session.durationMs = Math.max(0, end.getTime() - new Date(session.startedAt).getTime());
    changed = true;
  }
  if (changed) {
    doc.totalDurationMs = doc.sessions.reduce((sum, session) => sum + (session.durationMs || 0), 0);
  }
  return changed;
};

const snapshotUser = (user) => ({
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email || '',
  accountType: user.accountType || 'Student',
});

const isAppPlatform = (platform) => {
  const value = String(platform || '').toLowerCase();
  return value === 'android' || value === 'ios';
};

const serializeUserDay = (doc) => {
  const user = doc.user && typeof doc.user === 'object' ? doc.user : null;
  const appSessions = (doc.sessions || []).filter((session) => isAppPlatform(session.platform));
  if (appSessions.length === 0) return null;

  return {
    userId: user?._id || doc.user,
    firstName: user?.firstName || doc.firstName || '',
    lastName: user?.lastName || doc.lastName || '',
    email: user?.email || doc.email || '',
    image: user?.image || '',
    accountType: user?.accountType || doc.accountType || 'Student',
    loginCount: appSessions.filter((session) => session.type === 'login').length,
    openCount: appSessions.length,
    totalDurationMs: appSessions.reduce((sum, session) => sum + (session.durationMs || 0), 0),
    firstSeenAt: doc.firstSeenAt,
    lastSeenAt: doc.lastSeenAt,
    sessions: appSessions.map((session) => ({
      sessionId: session.sessionId,
      type: session.type,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMs: session.durationMs || 0,
      platform: session.platform || '',
      appVersion: session.appVersion || '',
    })),
  };
};

const summarizeDays = (dateKeys, docs) => {
  const byDate = new Map();
  for (const doc of docs) {
    const list = byDate.get(doc.dateKey) || [];
    list.push(doc);
    byDate.set(doc.dateKey, list);
  }

  const uniqueUserIds = new Set();
  const uniqueLoginUserIds = new Set();

  const days = dateKeys.map((dateKey) => {
    const list = byDate.get(dateKey) || [];
    const users = list.map(serializeUserDay).filter(Boolean);
    users.forEach((user) => {
      uniqueUserIds.add(String(user.userId));
      if (user.loginCount > 0) uniqueLoginUserIds.add(String(user.userId));
    });
    return {
      date: dateKey,
      uniqueUsers: users.length,
      uniqueLogins: users.filter((user) => user.loginCount > 0).length,
      loginEvents: users.reduce((sum, user) => sum + user.loginCount, 0),
      openEvents: users.reduce((sum, user) => sum + user.openCount, 0),
      totalDurationMs: users.reduce((sum, user) => sum + user.totalDurationMs, 0),
      users,
    };
  });

  return {
    days,
    summary: {
      uniqueUsers: uniqueUserIds.size,
      uniqueLogins: uniqueLoginUserIds.size,
      loginEvents: days.reduce((sum, day) => sum + day.loginEvents, 0),
      openEvents: days.reduce((sum, day) => sum + day.openEvents, 0),
      totalDurationMs: days.reduce((sum, day) => sum + day.totalDurationMs, 0),
    },
  };
};

exports.startSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const type = req.body?.type === 'login' ? 'login' : 'open';
    const sessionId = String(req.body?.sessionId || '').trim();
    const platform = String(req.body?.platform || '').toLowerCase().slice(0, 32);
    const appVersion = String(req.body?.appVersion || '').slice(0, 32);

    if (!userId || !sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    if (!isAppPlatform(platform)) {
      return res.status(200).json({ success: true, data: { skipped: true, reason: 'not-app' } });
    }

    const user = await User.findById(userId).select('firstName lastName email accountType');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const dateKey = istDateKey(now);
    let doc = await AppUsageDay.findOne({ user: userId, dateKey });
    if (!doc) {
      doc = new AppUsageDay({
        user: userId,
        dateKey,
        ...snapshotUser(user),
        firstSeenAt: now,
        lastSeenAt: now,
      });
    } else {
      Object.assign(doc, snapshotUser(user));
    }

    closeOpenSessions(doc, now);

    doc.sessions.push({
      sessionId,
      type,
      startedAt: now,
      lastHeartbeatAt: now,
      endedAt: null,
      durationMs: 0,
      platform,
      appVersion,
    });
    if (doc.sessions.length > MAX_SESSIONS) {
      doc.sessions = doc.sessions.slice(-MAX_SESSIONS);
    }

    doc.openCount += 1;
    if (type === 'login') doc.loginCount += 1;
    doc.lastSeenAt = now;
    await doc.save();

    return res.status(200).json({
      success: true,
      data: { sessionId, dateKey, type },
    });
  } catch (error) {
    console.error('[usage] startSession', error);
    return res.status(500).json({ success: false, message: 'Could not start session' });
  }
};

exports.heartbeatSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = String(req.body?.sessionId || '').trim();
    if (!userId || !sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    const now = new Date();
    const dateKey = istDateKey(now);
    const yesterday = shiftDateKey(dateKey, -1);
    const doc =
      (await AppUsageDay.findOne({ user: userId, dateKey })) ||
      (await AppUsageDay.findOne({ user: userId, dateKey: yesterday }));

    if (!doc) {
      return res.status(200).json({ success: true, data: { skipped: true } });
    }

    const session = [...doc.sessions].reverse().find((item) => item.sessionId === sessionId && !item.endedAt);
    if (!session) {
      return res.status(200).json({ success: true, data: { skipped: true } });
    }

    session.lastHeartbeatAt = now;
    session.durationMs = Math.max(0, now.getTime() - new Date(session.startedAt).getTime());
    doc.totalDurationMs = doc.sessions.reduce((sum, item) => sum + (item.durationMs || 0), 0);
    doc.lastSeenAt = now;
    await doc.save();

    return res.status(200).json({ success: true, data: { durationMs: session.durationMs } });
  } catch (error) {
    console.error('[usage] heartbeatSession', error);
    return res.status(500).json({ success: false, message: 'Could not update session' });
  }
};

exports.endSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = String(req.body?.sessionId || '').trim();
    if (!userId || !sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    const now = new Date();
    const dateKey = istDateKey(now);
    const yesterday = shiftDateKey(dateKey, -1);
    const doc =
      (await AppUsageDay.findOne({ user: userId, dateKey })) ||
      (await AppUsageDay.findOne({ user: userId, dateKey: yesterday }));

    if (!doc) {
      return res.status(200).json({ success: true, data: { skipped: true } });
    }

    const session = [...doc.sessions].reverse().find((item) => item.sessionId === sessionId && !item.endedAt);
    if (session) {
      session.endedAt = now;
      session.lastHeartbeatAt = now;
      session.durationMs = Math.max(0, now.getTime() - new Date(session.startedAt).getTime());
    }
    doc.totalDurationMs = doc.sessions.reduce((sum, item) => sum + (item.durationMs || 0), 0);
    doc.lastSeenAt = now;
    await doc.save();

    return res.status(200).json({
      success: true,
      data: { durationMs: session?.durationMs || 0 },
    });
  } catch (error) {
    console.error('[usage] endSession', error);
    return res.status(500).json({ success: false, message: 'Could not end session' });
  }
};

const monthDateKeys = (year, month) => {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const keys = [];
  const mm = String(month).padStart(2, '0');
  for (let day = 1; day <= daysInMonth; day += 1) {
    keys.push(`${year}-${mm}-${String(day).padStart(2, '0')}`);
  }
  return keys;
};

const parseRequestedMonth = (query, todayKey) => {
  const [todayYear, todayMonth] = todayKey.split('-').map(Number);
  const raw = String(query.month || '').trim();
  if (/^\d{4}-\d{2}$/.test(raw)) {
    const [year, month] = raw.split('-').map(Number);
    if (year >= 2020 && year <= 2100 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }
  const year = parseInt(query.year, 10);
  const month = parseInt(query.month, 10);
  if (year >= 2020 && year <= 2100 && month >= 1 && month <= 12) {
    return { year, month };
  }
  return { year: todayYear, month: todayMonth };
};

exports.getAdminUsage = async (req, res) => {
  try {
    const studentsOnly = req.query.studentsOnly !== 'false';
    const today = istDateKey();
    const { year, month } = parseRequestedMonth(req.query, today);
    const dateKeys = monthDateKeys(year, month);

    const match = {
      dateKey: { $gte: dateKeys[0], $lte: dateKeys[dateKeys.length - 1] },
    };
    if (studentsOnly) match.accountType = 'Student';

    const docs = await AppUsageDay.find(match)
      .populate('user', 'firstName lastName email image accountType')
      .sort({ lastSeenAt: -1 })
      .lean();

    const { days: dayRows, summary } = summarizeDays(dateKeys, docs);

    return res.status(200).json({
      success: true,
      data: {
        timezone: IST,
        today,
        year,
        month,
        from: dateKeys[0],
        to: dateKeys[dateKeys.length - 1],
        days: dayRows,
        summary,
      },
    });
  } catch (error) {
    console.error('[usage] getAdminUsage', error);
    return res.status(500).json({ success: false, message: 'Could not load usage' });
  }
};
