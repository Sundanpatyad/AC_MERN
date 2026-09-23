const express = require('express');
const { listLatestVideos, getVideoDetails } = require('../controllers/youtube');

const router = express.Router();

router.get('/videos', listLatestVideos);
router.get('/videos/:id', getVideoDetails);

module.exports = router;
