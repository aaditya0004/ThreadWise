const express = require('express');
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware');
const {search, getFeed} = require('../controllers/emailConroller');

router.get('/search', protect, search);
router.get('/feed', protect, getFeed);

module.exports = router;