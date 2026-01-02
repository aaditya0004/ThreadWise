const express = require('express');
const router = express.Router();
const {connectAccount, getEmails, getAccounts, deleteAccount} = require('../controllers/accountController');
const {protect} = require('../middlewares/authMiddleware');
 
router.post('/', protect, connectAccount);
router.get('/', protect, getAccounts);
router.get('/:id/emails', protect, getEmails);
router.delete('/:id', protect, deleteAccount);
module.exports = router;