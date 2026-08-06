const express = require('express');
const router = express.Router();

const { createMockTests, getMockDetails, getMockTests, addMockTestToSeries, addAttachmentsToSeries } = require('../controllers/mockTest');
const { auth, isInstructor, isStudent } = require('../middleware/auth');
const {
    createMockTestSeries,
    getAllMockTestSeries,
    getAllMockTestSeriesStudent,
    getMockTestSeriesById,
    updateMockTestSeries,
    addMockTestToSeries: addMockTestToSeriesNew,
    addBulkQuestionsToMockTest,
    updateNegativeMarking,
    getMockTestById
} = require('../controllers/mockTestSeries');
const { createAttempt, getAttemptsByUser, getRankings, getUserRankingByName, getAllAttemptedTestNames } = require('../controllers/attemptDetails');

// Mock test series routes
router.post('/createMockTestSeries', auth, isInstructor, createMockTestSeries);
router.get('/getMockTests', auth, isInstructor, getAllMockTestSeries);
router.get('/getMockTest', getAllMockTestSeriesStudent);
router.get('/getMockTestSeriesById/:id', getMockTestSeriesById);
router.put('/updateMockTestSeries/:id', auth, updateMockTestSeries);

// Mock test routes (legacy)
router.post('/createMockTest', auth, isInstructor, createMockTests);
router.post('/addMocktestToSeries', auth, addMockTestToSeries);
router.post('/series/:seriesId/attachments', auth, addAttachmentsToSeries);

// New mock test management routes
router.post('/series/:seriesId/mocktest', auth, isInstructor, addMockTestToSeriesNew);
router.post('/series/:seriesId/mocktest/:mockTestId/questions', auth, isInstructor, addBulkQuestionsToMockTest);
router.patch('/series/:seriesId/mocktest/:mockTestId/negative', auth, isInstructor, updateNegativeMarking);
router.get('/series/:seriesId/mocktest/:mockTestId', auth, getMockTestById);

// Attempt routes
router.get('/getAttemptsByUser', auth, getAttemptsByUser);
router.post('/createAttemptDetails', auth, createAttempt);
router.get('/getRankings', auth, getRankings);
router.get('/getRankingByName', auth, getUserRankingByName);
router.get('/getAttemptedTestNames', auth, getAllAttemptedTestNames);

module.exports = router;
