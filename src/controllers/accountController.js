const ConnectedAccount = require('../models/connectedAccountModel');
const CryptoJS = require('crypto-js');
const {fetchEmails} = require('../services/imapService');
const {indexEmail} = require('../services/searchService');
const {categorizeEmail} = require('../services/aiService');
const {triggerWebhook, sendSlackAlert} = require('../services/notificationService');

// @desc    Connect a new email account 
// @route   POST /api/accounts
// @access  Private
const connectAccount = async (req, res) => {
    // 1. Get the data from the request body
    // We assume the user will provide their email, app password, and the host
    const {email, imapPassword, imapHost} = req.body;

    if(!email || !imapPassword || !imapHost) {
        res.status(400).json({message: 'Please provide the email, password, and the host'});
        return;
    }

    try{
        // 2. Encrypt the Password
        const encryptedPassword = CryptoJS.AES.encrypt(
            imapPassword,
            process.env.ENCRYPTION_KEY
        ).toString();

        // 3. Create the new account in the db
        // req.user.id comes from our 'protect' middleware
        const account = await ConnectedAccount.create({
            user: req.user.id,
            email,
            imapPassword: encryptedPassword,
            imapHost,
        });

        res.status(201).json({
            message: "Account connected successfully",
            accountId: account.id,
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// @desc    Get emails for a specific account 
// @route   GET /api/accounts/:id/emails
// @access  Private
const getEmails = async (req, res) => {
    try{
        // 1. Find the account in the db
        // We also check that this account belongs to the logged in user for security
        const account = await ConnectedAccount.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if(!account){
            return res.status(404).json({message: 'Account not found'});
        }

        // 2. Decrypt the password
        const bytes = CryptoJS.AES.decrypt(account.imapPassword, process.env.ENCRYPTION_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        console.log('Decrypted password length:', originalPassword.length);
        console.log('Decrypted password (first 3 chars):', originalPassword.slice(0, 3), '***');

        // 3. Prepare the config for our service
        const accountConfig = {
            user: account.email,
            password: originalPassword,
            host: account.imapHost,
            port: account.imapPort,
            tls: account.tls,
        };

        // 4. Call the service to fetch emails
        // This might take a few seconds, so we await it
        const emails = await fetchEmails(accountConfig);

        // 5. Save emails to Elasticsearch 
        // We loop through the fetched emails and save them one by one 
        // In a real loop, we use bulk indexing for speed 
        for(const email of emails){
            // (1) Ask the AI to categorize the email
            // We use the body or snippet for analysis 
            const category = await categorizeEmail(email);

            // if AI thinks the email is under "INTERESTED", fire the alerts
            if(category === 'Interested'){
                // We run them in the bg, no await, so we dont slow down the loop 
                triggerWebhook(email);
                sendSlackAlert(email);
            }

            // (2) Index the email with the new category 
            await indexEmail({
                ...email,
                userId: req.user.id,   // Attach user id so we know who owns it 
                accountId: account.id,  // Attach account id 
                folder: 'INBOX',
                isRead: false,
                category,         // AI Label
            });

            email.category = category
        }

        res.json(emails);
    }
    catch(error){
        console.error('getEmails error:', error);
        res.status(500).json({message: 'Failed to fetch emails'});
    }
};

module.exports = {
    connectAccount,
    getEmails,
};
