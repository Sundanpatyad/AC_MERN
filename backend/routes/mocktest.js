const express = require('express');
const router = express.Router();

const { createMockTests, getMockDetails, getMockTests } = require('../controllers/mockTest');
const { auth, isInstructor, isStudent } = require('../middleware/auth');
const { createMockTestSeries, getAllMockTestSeries, getAllMockTestSeriesStudent, getMockTestSeriesById, updateMockTestSeries } = require('../controllers/mockTestSeries');
const { createAttempt, getAttemptsByUser } = require('../controllers/attemptDetails');

router.post('/createMockTest', auth, isInstructor, createMockTests);
router.get('/getMockTests', auth,isInstructor, getAllMockTestSeries);
router.get('/getMockTest', getAllMockTestSeriesStudent);
router.post('/createMockTestSeries', auth, isInstructor, createMockTestSeries);
router.get('/getMockTestSeriesById/:id',getMockTestSeriesById);
router.get('/getAttemptsByUser',auth , getAttemptsByUser);
router.post('/createAttemptDetails', auth , createAttempt);
router.put('/updateMockTestSeries/:id', auth , updateMockTestSeries);

module.exports = router;