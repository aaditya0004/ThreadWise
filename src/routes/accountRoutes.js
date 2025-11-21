const express = require('express');
const router = express.Router();
const {connectAccount, getEmails} = require('../controllers/accountController');
const {protect} = require('../middlewares/authMiddleware');
 
router.post('/', protect, connectAccount);
router.get('/:id/emails', protect, getEmails);

module.exports = router;