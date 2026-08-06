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
      incorrectAnswerDetails
    } = req.body;
    const userId = req.user.id;

    const newAttempt = new AttemptDetails({
      user: userId,
      mockTestSeries: mockId,
      testName,
      score,
      totalQuestions,
      timeTaken,
      correctAnswers,
      incorrectAnswers,
      incorrectAnswerDetails
    });

    await newAttempt.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        mocktests: mockId,
        attempts: newAttempt._id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Attempt recorded successfully',
      attempt: newAttempt
    });
  } catch (error) {
    console.error('Error in createAttempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record attempt',
      error: error.message
    });
  }
};

exports.getAttemptsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    const user = await User.findById(userId)
      .select('firstName lastName email accountType image')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch attempts with populated fields
    const attempts = await AttemptDetails.find({ user: userId })
      .populate('mockTestSeries', 'seriesName totalQuestions duration') // Adjust fields as needed
      .sort({ createdAt: -1 })
      .lean();

    // Calculate some statistics
    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;

    res.status(200).json({
      success: true,
      user: {
        ...user,
        totalAttempts,
        averageScore: averageScore.toFixed(2)
      },
      attempts
    });
  } catch (error) {
    console.error('Error in getAttemptsByUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attempts and user details',
      error: error.message
    });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await AttemptDetails.findById(attemptId)
      .populate('user', 'firstName lastName email')
      .populate('mockTestSeries', 'seriesName');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      attempt
    });
  } catch (error) {
    console.error('Error in getAttemptById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attempt',
      error: error.message
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
                as: 'seriesDetails'
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
                as: 'seriesDetails'
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
          as: 'seriesDetails'
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
          as: 'seriesDetails'
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

