const { request } = require('express');
const AttemptDetails = require('../models/attemptDetails'); // Adjust the path as needed
const User = require('../models/user'); // Adjust the path as needed
const mongoose = require('mongoose');

exports.createAttempt = async (req, res) => {
  try {
    const {
      mockId,
      testName,
      score,
      totalQuestions,
      timeTaken,
      correctAnswers,
      incorrectAnswers,
      incorrectAnswerDetails,
      skippedAnswers,
      skippedAnswerDetails,
    } = req.body;
    const userId = req.user.id;

    const normalizeItems = (items = [], type) =>
      (Array.isArray(items) ? items : []).map((item) => ({
        questionIndex: item.questionIndex,
        questionText: item.questionText || '',
        userAnswer: item.userAnswer || (type === 'skipped' ? 'Not answered' : ''),
        correctAnswer: item.correctAnswer || '',
        questionType: item.questionType || 'MCQ',
        questionImage: item.questionImage || '',
        leftColumn: item.leftColumn,
        rightColumn: item.rightColumn,
        type: item.type || type,
      }));

    const correctItems = normalizeItems(correctAnswers, 'correct');
    const incorrectItems = normalizeItems(incorrectAnswerDetails, 'incorrect');
    const skippedItems = normalizeItems(skippedAnswerDetails, 'skipped');

    const newAttempt = new AttemptDetails({
      user: userId,
      mockTestSeries: mockId,
      testName,
      score,
      totalQuestions,
      timeTaken,
      correctAnswers: correctItems,
      incorrectAnswers: Number(incorrectAnswers) || incorrectItems.length,
      incorrectAnswerDetails: incorrectItems,
      skippedAnswers: Number(skippedAnswers) || skippedItems.length,
      skippedAnswerDetails: skippedItems,
    });

    await newAttempt.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        mocktests: mockId,
        attempts: newAttempt._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Attempt recorded successfully',
      attempt: newAttempt,
    });
  } catch (error) {
    console.error('Error in createAttempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record attempt',
      error: error.message,
    });
  }
};

exports.getAttemptsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(userId)
      .select('firstName lastName email accountType image')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const filter = { user: userId };
    const [totalAttempts, attempts] = await Promise.all([
      AttemptDetails.countDocuments(filter),
      AttemptDetails.find(filter)
        .select(
          'testName score totalQuestions timeTaken incorrectAnswers skippedAnswers createdAt attemptDate mockTestSeries'
        )
        .populate('mockTestSeries', 'seriesName thumbnail')
        .sort({ attemptDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const summaryAttempts = attempts.map((attempt) => {
      const incorrectCount = Number(attempt.incorrectAnswers) || 0;
      const skippedCount = Number(attempt.skippedAnswers) || 0;
      const correctCount = Math.max(
        0,
        (Number(attempt.totalQuestions) || 0) - incorrectCount - skippedCount
      );
      return {
        _id: attempt._id,
        testName: attempt.testName,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        timeTaken: attempt.timeTaken,
        incorrectAnswers: incorrectCount,
        skippedAnswers: skippedCount,
        correctCount,
        createdAt: attempt.createdAt,
        attemptDate: attempt.attemptDate,
        mockTestSeries: attempt.mockTestSeries,
      };
    });

    const averageScore = totalAttempts
      ? (
          (
            await AttemptDetails.aggregate([
              { $match: { user: new mongoose.Types.ObjectId(userId) } },
              { $group: { _id: null, avg: { $avg: '$score' } } },
            ])
          )[0]?.avg || 0
        ).toFixed(2)
      : '0.00';

    res.status(200).json({
      success: true,
      user: {
        ...user,
        totalAttempts,
        averageScore,
      },
      attempts: summaryAttempts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalAttempts,
        totalPages: Math.max(1, Math.ceil(totalAttempts / limitNum)),
        hasNextPage: pageNum * limitNum < totalAttempts,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error in getAttemptsByUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attempts and user details',
      error: error.message,
    });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attempt id',
      });
    }

    const attempt = await AttemptDetails.findById(attemptId)
      .populate('mockTestSeries', 'seriesName thumbnail')
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    if (String(attempt.user) !== String(userId) && req.user.accountType !== 'Instructor' && req.user.accountType !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own attempts',
      });
    }

    const incorrectCount = Number(attempt.incorrectAnswers) || 0;
    const skippedCount =
      Number(attempt.skippedAnswers) ||
      (Array.isArray(attempt.skippedAnswerDetails) ? attempt.skippedAnswerDetails.length : 0);
    const correctItems = Array.isArray(attempt.correctAnswers) ? attempt.correctAnswers : [];
    const incorrectItems = Array.isArray(attempt.incorrectAnswerDetails)
      ? attempt.incorrectAnswerDetails
      : [];
    const skippedItems = Array.isArray(attempt.skippedAnswerDetails)
      ? attempt.skippedAnswerDetails
      : [];

    const allQuestionsReview = [
      ...correctItems.map((item) => ({ ...item, type: item.type || 'correct' })),
      ...incorrectItems.map((item) => ({ ...item, type: item.type || 'incorrect' })),
      ...skippedItems.map((item) => ({ ...item, type: item.type || 'skipped' })),
    ].sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));

    res.status(200).json({
      success: true,
      attempt: {
        ...attempt,
        correctCount: correctItems.length,
        incorrectAnswers: incorrectCount,
        skippedAnswers: skippedCount,
        allQuestionsReview,
      },
    });
  } catch (error) {
    console.error('Error in getAttemptById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attempt',
      error: error.message,
    });
  }
};

exports.getAttemptsByMockTest = async (req, res) => {
  try {
    const { mockId } = req.params;
    const attempts = await AttemptDetails.find({ mockTestSeries: mockId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      attempts
    });
  } catch (error) {
    console.error('Error in getAttemptsByMockTest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attempts',
      error: error.message
    });
  }
};

exports.getRankings = async (req, res) => {
  try {
    const {
      testId,    // Filter by mockTestSeries ObjectId
      testName,  // Filter by testName string
      minRank,   // Filter by minimum rank
      maxRank,   // Filter by maximum rank
      page = 1,
      limit = 10
    } = req.query;


    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // --- Stage 1: Build the initial $match to filter early ---
    const matchStage = {};
    if (testId) {
      matchStage.mockTestSeries = new mongoose.Types.ObjectId(testId);
    }
    if (testName) {
      matchStage.testName = testName;
    }

    const pipeline = [
      // Filter early to reduce documents scanned
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),

      // Sort before grouping so $first gives latest attempt
      { $sort: { attemptDate: -1 } },

      // Group by user + testName + series to get their latest attempt per specific test
      {
        $group: {
          _id: { user: '$user', testName: '$testName', mockTestSeries: '$mockTestSeries' },
          score: { $first: '$score' },
          attemptDate: { $first: '$attemptDate' },
          user: { $first: '$user' },
          testName: { $first: '$testName' },
          mockTestSeries: { $first: '$mockTestSeries' },
          totalQuestions: { $first: '$totalQuestions' },
          timeTaken: { $first: '$timeTaken' }
        }
      },

      // Assign ranks partitioned by (testName + series), sorted by score desc
      {
        $setWindowFields: {
          partitionBy: { testName: '$testName', mockTestSeries: '$mockTestSeries' },
          sortBy: { score: -1 },
          output: {
            rank: { $rank: {} }
          }
        }
      },

      // Stage 4: Filter by rank if requested
      ...(minRank || maxRank ? [{
        $match: {
          rank: {
            ...(minRank ? { $gte: parseInt(minRank) } : {}),
            ...(maxRank ? { $lte: parseInt(maxRank) } : {})
          }
        }
      }] : []),

      // Sort by rank ascending so pagination is stable
      { $sort: { testName: 1, rank: 1 } },

      // Split into metadata (total count), loggedInUser, and paginated data
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          loggedInUser: [
            { $match: { user: req.user && req.user.id ? new mongoose.Types.ObjectId(req.user.id) : null } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails',
                pipeline: [{ $project: { firstName: 1, lastName: 1, image: 1 } }]
              }
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: false } },

            // Lookup series details to get seriesName
            {
              $lookup: {
                from: 'mocktestseries',
                localField: 'mockTestSeries',
                foreignField: '_id',
                as: 'seriesDetails',
                pipeline: [{ $project: { seriesName: 1 } }],
              }
            },
            { $unwind: { path: '$seriesDetails', preserveNullAndEmptyArrays: true } },

            {
              $project: {
                _id: 0,
                userId: '$user',
                userName: {
                  $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
                },
                userImage: '$userDetails.image',
                score: 1,
                testName: 1,
                seriesName: '$seriesDetails.seriesName',
                attemptDate: 1,
                rank: 1,
                mockTestSeriesId: '$mockTestSeries',
                totalQuestions: 1,
                timeTaken: 1
              }
            }
          ],
          data: [
            { $skip: skip },
            { $limit: limitNum },

            // Lookup user details only on the paginated slice
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails',
                pipeline: [
                  { $project: { firstName: 1, lastName: 1, image: 1 } }
                ]
              }
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: false } },

            // Lookup series details to get seriesName
            {
              $lookup: {
                from: 'mocktestseries',
                localField: 'mockTestSeries',
                foreignField: '_id',
                as: 'seriesDetails',
                pipeline: [{ $project: { seriesName: 1 } }],
              }
            },
            { $unwind: { path: '$seriesDetails', preserveNullAndEmptyArrays: true } },

            // Final projection
            {
              $project: {
                _id: 0,
                userId: '$user',
                userName: {
                  $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
                },
                userImage: '$userDetails.image',
                score: 1,
                testName: 1,
                seriesName: '$seriesDetails.seriesName',
                attemptDate: 1,
                rank: 1,
                mockTestSeriesId: '$mockTestSeries',
                totalQuestions: 1,
                timeTaken: 1
              }
            }
          ]
        }
      }
    ];

    const [result] = await AttemptDetails.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: result?.data ?? [],
      loggedInUserRank: result?.loggedInUser || [],
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error in getRankings:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching rankings',
      error: error.message
    });
  }
};


/**
 * GET /getRankingByName?name=John&testId=...&testName=...
 * Search rankings for a specific user by their name (partial, case-insensitive).
 * Optionally filter by testId or testName.
 */
exports.getUserRankingByName = async (req, res) => {
  try {
    const { name, testId, testName } = req.query;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query param "name" is required'
      });
    }

    const User = require('../models/user');

    // Step 1: Find users whose full name (firstName + lastName) matches the search
    const nameRegex = new RegExp(name.trim(), 'i');
    const matchedUsers = await User.find({
      $or: [
        { firstName: nameRegex },
        { lastName: nameRegex },
        // match "John Doe" style full-name searches
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: name.trim(),
              options: 'i'
            }
          }
        }
      ]
    }).select('_id firstName lastName image').lean();

    if (!matchedUsers.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No users found matching the given name'
      });
    }

    const userIds = matchedUsers.map(u => u._id);

    // Step 2: Build the $match stage for AttemptDetails
    const matchStage = { user: { $in: userIds } };
    if (testId) {
      matchStage.mockTestSeries = new mongoose.Types.ObjectId(testId);
    }
    if (testName) {
      matchStage.testName = testName;
    }

    // Step 3: Run the rankings pipeline for those users
    const pipeline = [
      { $match: matchStage },

      // Sort before grouping so $first gives the latest attempt
      { $sort: { attemptDate: -1 } },

      // Group by user + testName + series to get latest attempt per specific test
      {
        $group: {
          _id: { user: '$user', testName: '$testName', mockTestSeries: '$mockTestSeries' },
          score: { $first: '$score' },
          attemptDate: { $first: '$attemptDate' },
          user: { $first: '$user' },
          testName: { $first: '$testName' },
          mockTestSeries: { $first: '$mockTestSeries' },
          totalQuestions: { $first: '$totalQuestions' },
          timeTaken: { $first: '$timeTaken' }
        }
      },

      // Assign ranks partitioned by (testName + series), sorted by score desc
      {
        $setWindowFields: {
          partitionBy: { testName: '$testName', mockTestSeries: '$mockTestSeries' },
          sortBy: { score: -1 },
          output: {
            rank: { $rank: {} }
          }
        }
      },

      { $sort: { testName: 1, rank: 1 } },

      // Attach user details
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, image: 1 } }
          ]
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: false } },

      // Lookup series details to get seriesName
      {
        $lookup: {
          from: 'mocktestseries',
          localField: 'mockTestSeries',
          foreignField: '_id',
          as: 'seriesDetails',
          pipeline: [{ $project: { seriesName: 1 } }],
        }
      },
      { $unwind: { path: '$seriesDetails', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          userId: '$user',
          userName: {
            $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
          },
          userImage: '$userDetails.image',
          score: 1,
          testName: 1,
          seriesName: '$seriesDetails.seriesName',
          attemptDate: 1,
          rank: 1,
          mockTestSeriesId: '$mockTestSeries',
          totalQuestions: 1,
          timeTaken: 1
        }
      }
    ];

    const results = await AttemptDetails.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error in getUserRankingByName:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user rankings',
      error: error.message
    });
  }
};

/**
 * GET /getAttemptedTestNames
 * Returns a list of all unique test names that have been attempted by users.
 * Useful for populating filter dropdowns in the UI.
 */
exports.getAllAttemptedTestNames = async (req, res) => {
  try {
    const testNames = await AttemptDetails.aggregate([
      {
        $group: {
          _id: { testName: '$testName', mockTestSeriesId: '$mockTestSeries' }
        }
      },
      {
        $lookup: {
          from: mongoose.model('MockTestSeries').collection.name,
          localField: '_id.mockTestSeriesId',
          foreignField: '_id',
          as: 'seriesDetails',
          pipeline: [
            {
              $project: {
                seriesName: 1,
                mockTests: {
                  _id: 1,
                  testName: 1,
                },
              },
            },
          ],
        }
      },
      {
        $unwind: { path: '$seriesDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          testName: '$_id.testName',
          mockTestSeriesId: '$_id.mockTestSeriesId',
          seriesName: '$seriesDetails.seriesName',
          mockTestId: {
            $let: {
              vars: {
                matchedTest: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: { $ifNull: ['$seriesDetails.mockTests', []] },
                        as: 'mock',
                        cond: { $eq: ['$$mock.testName', '$_id.testName'] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$matchedTest._id'
            }
          }
        }
      },
      { $sort: { testName: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: testNames
    });
  } catch (error) {
    console.error('Error in getAllAttemptedTestNames:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve test names',
      error: error.message
    });
  }
};

