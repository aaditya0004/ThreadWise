const cron = require('node-cron');
const CryptoJS = require("crypto-js");
const ConnectedAccount = require('../models/connectedAccountModel');
const User = require('../models/userModel');
const { fetchEmails } = require('../services/imapService'); // Assuming your IMAP logic is here
const { categorizeEmail } = require('../services/aiService');
const { indexEmail } = require('../services/searchService');

const startAutoSync = () => {
    console.log('⏰ Auto-Sync Cron Job initialized.');

    // This runs every 10 minutes automatically
    // cron.schedule('*/10 * * * *', async () => {
    cron.schedule('*/10 * * * *', async () => {
        console.log('🔄 Running background email sync...');

        try {
            // Find all connected accounts in the database
            const accounts = await ConnectedAccount.find({});

            for (const account of accounts) {
                try {
                    // Fetch user rules
                    const user = await User.findById(account.user);
                    const rules = user ? user.customRules : {};

                    // Decrypt the password for this account
                    const bytes = CryptoJS.AES.decrypt(
                        account.imapPassword,
                        process.env.ENCRYPTION_KEY
                    );
                    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

                    // Format the config exactly as imapService expects it
                    const accountConfig = {
                        user: account.email,
                        password: originalPassword,
                        host: account.imapHost,
                        port: account.imapPort,
                        tls: account.tls,
                    };

                    // Fetch unread/new emails via IMAP
                    // NOTE: You will need to extract your IMAP fetching logic from accountController 
                    // into a reusable function in emailService.js if you haven't already.
                    const newEmails = await fetchEmails(accountConfig); 

                    for (const email of newEmails) {
                        const category = await categorizeEmail(email, rules);
                        await indexEmail({ ...email, category, userId: account.user });
                    }

                    if (newEmails.length > 0) {
                        console.log(`✅ Auto-synced ${newEmails.length} emails for ${account.email}`);
                    }
                } catch (accError) {
                    console.error(`❌ Failed to auto-sync account ${account.email}`);
                    console.error(accError);
                }
            }
        } catch (error) {
            console.error('Auto-sync job failed', error);
        }
    });
};

module.exports = { startAutoSync };