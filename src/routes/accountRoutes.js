const express = require('express');
const router = express.Router();
const {connectAccount, getEmails, getAccounts} = require('../controllers/accountController');
const {protect} = require('../middlewares/authMiddleware');
 
router.post('/', protect, connectAccount);
router.get('/', protect, getAccounts);
router.get('/:id/emails', protect, getEmails);
module.exports = router;