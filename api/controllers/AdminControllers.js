const mongoose = require('mongoose');
const { MockTestSeries } = require('../models/mockTestSeries');
const Order = require('../models/order');
const User = require('../models/user');

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getUsersByMockTest = async (req, res) => {
  try {
    const fromDate = parseDate(req.query.from);
    const toDate = parseDate(req.query.to);
    const orderDateMatch = {};
    if (fromDate) orderDateMatch.$gte = fromDate;
    if (toDate) orderDateMatch.$lte = toDate;

    const orderMatch = {
      status: 'paid',
      $expr: { $in: ['$$seriesId', { $ifNull: ['$mockTestIds', []] }] },
    };
    if (Object.keys(orderDateMatch).length) {
      orderMatch.createdAt = orderDateMatch;
    }

    const mockTestStats = await MockTestSeries.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'mocktests',
          as: 'purchasers',
          pipeline: [
            {
              $project: { _id: 1 },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'studentsEnrolled',
          foreignField: '_id',
          as: 'enrolledUsers',
          pipeline: [
            {
              $project: { _id: 1 },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { seriesId: '$_id' },
          pipeline: [
            { $match: orderMatch },
            {
              $project: {
                amount: 1,
                mockTestIds: 1,
              },
            },
          ],
          as: 'paidOrders',
        },
      },
      {
        $addFields: {
          numericPrice: {
            $convert: { input: '$price', to: 'double', onError: 0, onNull: 0 },
          },
          usersCombined: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$purchasers', []] } }, 0] },
              '$purchasers',
              { $ifNull: ['$enrolledUsers', []] },
            ],
          },
        },
      },
      {
        $addFields: {
          totalUsers: { $size: '$usersCombined' },
          paidRevenue: {
            $sum: {
              $map: {
                input: { $ifNull: ['$paidOrders', []] },
                as: 'order',
                in: {
                  $let: {
                    vars: {
                      itemCount: {
                        $max: [
                          { $size: { $ifNull: ['$$order.mockTestIds', []] } },
                          1,
                        ],
                      },
                    },
                    in: {
                      $divide: [{ $ifNull: ['$$order.amount', 0] }, '$$itemCount'],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          estimatedRevenue: {
            $multiply: [{ $ifNull: ['$numericPrice', 0] }, '$totalUsers'],
          },
        },
      },
      {
        $addFields: {
          revenue: {
            $cond: [
              { $gt: ['$paidRevenue', 0] },
              '$paidRevenue',
              '$estimatedRevenue',
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          seriesId: '$_id',
          testName: '$seriesName',
          price: { $ifNull: ['$numericPrice', 0] },
          thumbnail: 1,
          status: 1,
          totalUsers: 1,
          enrollments: '$totalUsers',
          revenue: { $round: ['$revenue', 2] },
          paidRevenue: { $round: ['$paidRevenue', 2] },
        },
      },
      { $sort: { revenue: -1, enrollments: -1, testName: 1 } },
    ]);

    const summary = mockTestStats.reduce(
      (acc, test) => {
        acc.totalRevenue += test.revenue || 0;
        acc.totalEnrollments += test.enrollments || 0;
        return acc;
      },
      { totalRevenue: 0, totalEnrollments: 0 }
    );

    res.status(200).json({
      success: true,
      data: mockTestStats,
      summary: {
        totalTests: mockTestStats.length,
        totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
        totalEnrollments: summary.totalEnrollments,
      },
    });
  } catch (error) {
    console.error('Error in getUsersByMockTest:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user data',
      error: error.message,
    });
  }
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPurchasersByMockTest = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = String(req.query.search || '').trim();

    if (!mongoose.Types.ObjectId.isValid(seriesId)) {
      return res.status(400).json({ success: false, message: 'Invalid test id' });
    }

    const seriesObjectId = new mongoose.Types.ObjectId(seriesId);
    const series = await MockTestSeries.findById(seriesObjectId)
      .select('studentsEnrolled seriesName')
      .lean();

    if (!series) {
      return res.status(404).json({ success: false, message: 'Mock test not found' });
    }

    const match = {
      $or: [
        { mocktests: seriesObjectId },
        { _id: { $in: series.studentsEnrolled || [] } },
      ],
    };

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      match.$and = [
        {
          $or: [
            { firstName: rx },
            { lastName: rx },
            { email: rx },
            { mobileNumber: rx },
          ],
        },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(match),
      User.find(match)
        .select('firstName lastName email mobileNumber')
        .sort({ firstName: 1, lastName: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
      success: true,
      data: users.map((user) => ({
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error in getPurchasersByMockTest:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching purchasers',
      error: error.message,
    });
  }
};

const getUsersWithoutAssignedMocks = async (req, res) => {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $match: {
                    status: 'paid',
                    mockTestIds: { $eq: [] }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$userDetails._id',
                    firstName: '$userDetails.firstName',
                    lastName: '$userDetails.lastName',
                    email: '$userDetails.email',
                    courses: '$userDetails.courses',
                    mobileNumber: '$userDetails.mobileNumber'
                }
            }
        ];

        const usersWithoutMock = await Order.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: usersWithoutMock
        });
    } catch (error) {
        console.error('Error fetching users without assigned mock tests:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};


module.exports = {
  getUsersByMockTest,
  getPurchasersByMockTest,
  getUsersWithoutAssignedMocks
};
