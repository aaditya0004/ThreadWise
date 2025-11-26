const axios = require('axios');

// 1. Generic webhook notification (e.g., for automation tools like Zapier)
const triggerWebhook = async(emailData) => {
    const url = process.env.WEBHOOK_SITE_URL;
    if(!url) return;

    try{
        await axios.post(url, {
            event: 'email.interested',
            email: emailData.from,
            subject: emailData.subject,
            snippet: emailData.snippet,
            timestamp: new Date().toISOString()
        });
        console.log("🔗 Webhook triggered successfully");
    }
    catch(error){
        console.error('Webhook failed:', error.message);
    }
}

// 2. Slack Notification
const sendSlackAlert = async (emailData) => {
    const url = process.env.SLACK_WEBHOOK_URL;
    if(!url) return;

    try{
        // Slack requires a specific JSON format called "blocks" or simple "text"
        await axios.post(url, {
            text: `New Interested Lead: ${emailData.subject}`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*🔥 New Interested Lead Detected!*`
                    }
                },
                {
                    type: "section",
                    fileds: [
                        {
                            type: "mrkdwn",
                            text: `*From*\n${emailData.from}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Subject*\n${emailData.subject}`
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Snippet*\n${emailData.snippet}`
                    }
                }
            ]
        });
        console.log('💬 Slack notification sent');
    }
    catch(error){
        console.error('Slack alert failed:', error.message);
    }
};

module.exports = {triggerWebhook, sendSlackAlert};