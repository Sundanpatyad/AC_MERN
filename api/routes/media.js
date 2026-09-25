const express = require('express');
const { streamMedia } = require('../controllers/media');

const router = express.Router();

router.get('/*', streamMedia);

module.exports = router;
