const express = require('express');
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware');
const {search} = require('../controllers/emailConroller');

router.get('/search', protect, search);

module.exports = router;