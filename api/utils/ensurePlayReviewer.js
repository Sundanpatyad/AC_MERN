const bcrypt = require('bcrypt');
const User = require('../models/user');
const Profile = require('../models/profile');
const { MockTestSeries } = require('../models/mockTestSeries');

const DEFAULT_EMAIL = 'reviewer@awakeningclasses.com';
const DEFAULT_PASSWORD = 'PlayReview@2026';

async function enrollReviewerInAllMocks(userId) {
  const seriesIds = await MockTestSeries.distinct('_id');
  if (!seriesIds.length) {
    console.log('[auth] Play reviewer: no mock tests to enroll');
    return 0;
  }

  await MockTestSeries.updateMany(
    {},
    { $addToSet: { studentsEnrolled: userId } }
  );

  try {
    await MockTestSeries.updateMany(
      { 'mockTests.0': { $exists: true } },
      { $addToSet: { 'mockTests.$[].studentsEnrolled': userId } }
    );
  } catch (error) {
    console.warn('[auth] Play reviewer nested mock enroll skipped:', error.message);
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { mocktests: { $each: seriesIds } },
  });

  console.log(`[auth] Play reviewer enrolled in ${seriesIds.length} mock tests`);
  return seriesIds.length;
}

async function ensurePlayReviewer() {
  const email = String(process.env.PLAY_REVIEW_EMAIL || DEFAULT_EMAIL)
    .trim()
    .toLowerCase();
  const password = String(process.env.PLAY_REVIEW_PASSWORD || DEFAULT_PASSWORD);

  if (!email || !password) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  let user = await User.findOne({ email });

  if (!user) {
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    user = await User.create({
      firstName: 'Play',
      lastName: 'Reviewer',
      email,
      password: hashedPassword,
      accountType: 'Student',
      additionalDetails: profileDetails._id,
      approved: true,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=Play Reviewer`,
    });
    console.log(`[auth] Play reviewer account created: ${email}`);
  } else {
    user.password = hashedPassword;
    user.accountType = user.accountType || 'Student';
    user.approved = true;
    await user.save();
    console.log(`[auth] Play reviewer account ready: ${email}`);
  }

  await enrollReviewerInAllMocks(user._id);
}

module.exports = { ensurePlayReviewer };
