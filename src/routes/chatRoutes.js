const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { chat } = require('../controllers/chatController');


router.post('/', protect, chat);
router.post('/', protect, chat);

module.exports = router;