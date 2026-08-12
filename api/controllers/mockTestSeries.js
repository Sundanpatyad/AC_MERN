const Mocktest = require("../models/mocktest");
const { MockTestSeries } = require("../models/mockTestSeries");
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/** Optional JWT user id for public list/detail endpoints (never 401s). */
function getOptionalUserId(req) {
    try {
        const authHeader = req.header('Authorization') || req.header('authorization');
        const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
        if (!token || !process.env.JWT_SECRET) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.id || decoded?._id || null;
    } catch {
        return null;
    }
}

function toObjectIdOrNull(id) {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
}

/** Shared projection: never load question banks for list/detail/home. */
function buildSeriesSummaryStages({ userObjectId = null, view = 'list' } = {}) {
    const isHome = view === 'home';

    const projectFields = {
        seriesName: 1,
        thumbnail: 1,
        price: 1,
        status: 1,
        createdAt: 1,
        totalTests: 1,
        studentsEnrolledCount: { $size: { $ifNull: ['$studentsEnrolled', []] } },
        isEnrolled: userObjectId
            ? { $in: [userObjectId, { $ifNull: ['$studentsEnrolled', []] }] }
            : { $literal: false },
        attachmentsCount: { $size: { $ifNull: ['$attachments', []] } },
        mockTestsCount: { $size: { $ifNull: ['$mockTests', []] } },
    };

    if (!isHome) {
        projectFields.description = 1;
        projectFields.updatedAt = 1;
        projectFields.attachments = {
            $map: {
                input: { $ifNull: ['$attachments', []] },
                as: 'a',
                in: { name: '$$a.name' },
            },
        };
        projectFields.mockTests = {
            $map: {
                input: { $ifNull: ['$mockTests', []] },
                as: 't',
                in: {
                    _id: '$$t._id',
                    testName: '$$t.testName',
                    duration: '$$t.duration',
                    price: '$$t.price',
                    status: '$$t.status',
                    createdAt: '$$t.createdAt',
                    updatedAt: '$$t.updatedAt',
                    totalQuestions: { $size: { $ifNull: ['$$t.questions', []] } },
                },
            },
        };
    }

    return [
        { $project: projectFields },
        { $sort: { createdAt: -1 } },
    ];
}

exports.createMockTestSeries = async (req, res) => {
    try {
        console.log("=== CREATE MOCK TEST SERIES API CALLED ===");
        console.log("req.body:", req.body);
        console.log("req.files keys:", req.files ? Object.keys(req.files) : 'No files');

        const { seriesName, description, price, status } = req.body;

        let mockTests = req.body.mockTests;
        if (mockTests && typeof mockTests === 'string') {
            mockTests = JSON.parse(mockTests);
        }

        const creator = req.user.id;

        let thumbnailUrl = "";
        const thumbnail = req.files?.thumbnail;
        if (thumbnail) {
            console.log("Thumbnail file detected:", thumbnail.name);
            const thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
            console.log("Cloudinary Upload Response:", thumbnailDetails?.secure_url);
            thumbnailUrl = thumbnailDetails.secure_url;
        } else {
            console.log("No thumbnail found in req.files!");
        }

        const newSeries = new MockTestSeries({
            seriesName,
            description,
            price,
            status,
            creator,
            thumbnail: thumbnailUrl,
            totalTests: mockTests ? mockTests.length : 0
        });

        const savedSeries = await newSeries.save();

        res.status(201).json({
            success: true,
            data: savedSeries
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllMockTestSeries = async (req, res) => {
    try {
        const userObjectId = toObjectIdOrNull(getOptionalUserId(req));
        const series = await MockTestSeries.aggregate([
            ...buildSeriesSummaryStages({ userObjectId, view: 'list' }),
        ]);
        res.status(200).json({
            success: true,
            data: series
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllMockTestSeriesStudent = async (req, res) => {
    try {
        const view = String(req.query.view || 'list').toLowerCase() === 'home' ? 'home' : 'list';
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || (view === 'home' ? 4 : 0), 0), 100);
        const userObjectId = toObjectIdOrNull(getOptionalUserId(req));

        const pipeline = [
            { $match: { status: 'published' } },
            ...buildSeriesSummaryStages({ userObjectId, view }),
        ];

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        const series = await MockTestSeries.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: series
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMockTestSeriesById = async (req, res) => {
    try {
        const wantFull = String(req.query.full || '').toLowerCase() === 'true'
            || String(req.query.full || '') === '1';
        const seriesObjectId = toObjectIdOrNull(req.params.id);

        if (!seriesObjectId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mock test series id'
            });
        }

        // Attempt / instructor edit: full document including questions.
        if (wantFull) {
            const series = await MockTestSeries.findById(seriesObjectId)
                .populate('creator', 'firstName lastName')
                .lean();

            if (!series) {
                return res.status(404).json({
                    success: false,
                    message: 'Mock test series not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: series
            });
        }

        // Detail / marketing page: project in Mongo — never load question banks.
        const userObjectId = toObjectIdOrNull(getOptionalUserId(req));
        const [series] = await MockTestSeries.aggregate([
            { $match: { _id: seriesObjectId } },
            ...buildSeriesSummaryStages({ userObjectId, view: 'list' }),
        ]);

        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        res.status(200).json({
            success: true,
            data: series
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateMockTestSeries = async (req, res) => {
    try {
        console.log("=== UPDATE MOCK TEST SERIES API CALLED ===");
        console.log("req.body:", req.body);
        console.log("req.files keys:", req.files ? Object.keys(req.files) : 'No files');

        const { seriesName, description, price, status } = req.body;

        let mockTests = req.body.mockTests;
        if (mockTests && typeof mockTests === 'string') mockTests = JSON.parse(mockTests);

        let attachments = req.body.attachments;
        if (attachments && typeof attachments === 'string') attachments = JSON.parse(attachments);

        // Find the existing series
        const existingSeries = await MockTestSeries.findById(req.params.id);
        if (!existingSeries) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        // Prepare update data
        const updateData = {};

        if (seriesName !== undefined) updateData.seriesName = seriesName;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (status !== undefined) updateData.status = status;
        if (attachments !== undefined) updateData.attachments = attachments;

        if (req.files && req.files.thumbnail) {
            console.log("Updating thumbnail. File detected:", req.files.thumbnail.name);
            const thumbnailDetails = await uploadImageToCloudinary(
                req.files.thumbnail,
                process.env.FOLDER_NAME
            );
            console.log("Cloudinary Upload Response:", thumbnailDetails?.secure_url);
            updateData.thumbnail = thumbnailDetails.secure_url;
        } else {
            console.log("No thumbnail file provided in this update request.");
        }

        // Handle mockTests with negative marking and question types
        if (mockTests !== undefined) {
            // Process each mock test and its questions
            updateData.mockTests = mockTests.map(test => {
                // Process questions to ensure proper structure
                const processedQuestions = test.questions?.map(question => {
                    const processedQuestion = {
                        text: question.text || "",
                        questionImage: question.questionImage || "",
                        questionType: question.questionType || 'MCQ',
                        options: Array.isArray(question.options) ? question.options : [],
                        correctAnswer: question.correctAnswer || ""
                    };

                    // Add leftColumn and rightColumn for MATCH questions
                    if (question.questionType === 'MATCH') {
                        if (question.leftColumn) processedQuestion.leftColumn = question.leftColumn;
                        if (question.rightColumn) processedQuestion.rightColumn = question.rightColumn;
                    }

                    // Add optional fields if provided
                    if (question.explanation) processedQuestion.explanation = question.explanation;
                    if (question.marks !== undefined) processedQuestion.marks = question.marks;

                    return processedQuestion;
                }) || [];

                return {
                    ...test,
                    questions: processedQuestions,
                    negative: test.negative !== undefined ? test.negative : 0,
                    updatedAt: new Date()
                };
            });

            // Update total tests count
            updateData.totalTests = mockTests.length + (attachments?.length || existingSeries.attachments?.length || 0);
        }

        // Check if any changes were made
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({
                success: true,
                data: existingSeries,
                message: 'No changes detected'
            });
        }

        // Update the series
        const updatedSeries = await MockTestSeries.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedSeries,
            message: 'Mock test series updated successfully'
        });
    } catch (error) {
        console.error('Error updating mock test series:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteMockTestSeries = async (req, res) => {
    try {
        const deletedSeries = await MockTestSeries.findByIdAndDelete(req.params.id);

        if (!deletedSeries) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mock test series deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============= NEW ENDPOINTS =============

// Add a new mock test to an existing series
exports.addMockTestToSeries = async (req, res) => {
    try {
        const { seriesId } = req.params;
        const { testName, duration, negative, price, status, questions } = req.body;

        // Validation
        if (!testName || !duration || !questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Test name, duration, and questions are required'
            });
        }

        // Find the series
        const series = await MockTestSeries.findById(seriesId);
        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        // Create new mock test object
        const newMockTest = {
            testName,
            duration,
            negative: negative || 0, // Optional, defaults to 0
            price: price || 0,
            status: status || 'draft',
            questions,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add to series
        series.mockTests.push(newMockTest);
        series.totalTests = series.mockTests.length + (series.attachments?.length || 0);

        await series.save();

        res.status(201).json({
            success: true,
            message: 'Mock test added successfully',
            data: series
        });
    } catch (error) {
        console.error('Error adding mock test:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add bulk questions to an existing mock test
exports.addBulkQuestionsToMockTest = async (req, res) => {
    try {
        const { seriesId, mockTestId } = req.params;
        const { questions } = req.body;

        // Validation
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Questions array is required and must not be empty'
            });
        }

        // Validate each question has required fields
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if ((!q.text && !q.questionImage) || !q.options || !q.correctAnswer) {
                return res.status(400).json({
                    success: false,
                    message: `Question at index ${i} is missing required fields (text or questionImage, options, correctAnswer)`
                });
            }
        }

        // Find the series
        const series = await MockTestSeries.findById(seriesId);
        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        // Find the specific mock test
        const mockTest = series.mockTests.id(mockTestId);
        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: 'Mock test not found in this series'
            });
        }

        // Add questions to the mock test
        mockTest.questions.push(...questions);
        mockTest.updatedAt = new Date();

        await series.save();

        res.status(200).json({
            success: true,
            message: `${questions.length} questions added successfully`,
            data: {
                mockTestId: mockTest._id,
                testName: mockTest.testName,
                totalQuestions: mockTest.questions.length,
                addedQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Error adding bulk questions:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update negative marking for a specific mock test
exports.updateNegativeMarking = async (req, res) => {
    try {
        const { seriesId, mockTestId } = req.params;
        const { negative } = req.body;

        if (negative === undefined || negative === null) {
            return res.status(400).json({
                success: false,
                message: 'Negative marking value is required'
            });
        }

        // Find the series
        const series = await MockTestSeries.findById(seriesId);
        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        // Find the specific mock test
        const mockTest = series.mockTests.id(mockTestId);
        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: 'Mock test not found in this series'
            });
        }

        // Update negative marking
        mockTest.negative = negative;
        mockTest.updatedAt = new Date();

        await series.save();

        res.status(200).json({
            success: true,
            message: 'Negative marking updated successfully',
            data: {
                mockTestId: mockTest._id,
                testName: mockTest.testName,
                negative: mockTest.negative
            }
        });
    } catch (error) {
        console.error('Error updating negative marking:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a specific mock test from a series
exports.getMockTestById = async (req, res) => {
    try {
        const { seriesId, mockTestId } = req.params;

        const series = await MockTestSeries.findById(seriesId);
        if (!series) {
            return res.status(404).json({
                success: false,
                message: 'Mock test series not found'
            });
        }

        const mockTest = series.mockTests.id(mockTestId);
        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: 'Mock test not found in this series'
            });
        }

        res.status(200).json({
            success: true,
            data: mockTest
        });
    } catch (error) {
        console.error('Error fetching mock test:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};