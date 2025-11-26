const axios = require('axios');

const ruleBasedCategory = (email) => {
    const subject = (email.subject || '').toLowerCase();
    const from = (email.from || '').toLowerCase();
    const body = (email.body || email.snippet || '').toLowerCase();

    // 0) Assessment / online test invited → Interested
    if (
        subject.includes('test') ||
        subject.includes('assessment') ||
        subject.includes('online test') ||
        subject.includes('coding test') ||
        subject.includes('conducted on') ||
        subject.includes('exam') ||
        subject.includes('registration') && subject.includes('test')
    ) {
        return 'Interested';
    }

    // 1) OTP / verification / email confirmation => General
    if (
        subject.includes('verification code') ||
        body.includes('verification code') ||
        subject.includes('confirm your email') ||
        body.includes('confirm your email') ||
        subject.includes('confirmation code') ||
        body.includes('one-time password') ||
        body.includes('otp')
    ) {
        return 'General';
    }

    // 2) Application feedback / survey emails => General
    if (
        subject.includes('share feedback') ||
        subject.includes('satisfaction survey') ||
        body.includes('satisfaction survey')
    ) {
        return 'General';
    }

    // 3) Job board newsletters / campaigns => Spam
    if (
        from.includes('dare2compete.news') ||
        from.includes('unstop') ||
        from.includes('wellfound') ||
        from.includes('naukri') ||
        subject.includes('new jobs') ||
        subject.includes('last chance') ||
        subject.includes('final call')
    ) {
        return 'Spam';
    }

    // 4) LinkedIn digests / message notifications => General
    if (
        from.includes('linkedin.com') &&
        (subject.includes('messaged you') ||
         subject.includes('connections') ||
         subject.includes('job alert') ||
         subject.includes('posts got') ||
         subject.includes('you have') ||
         subject.includes('notifications'))
    ) {
        return 'General';
    }

    // No rule matched
    return null;
};

const categorizeEmail = async (email) => {
    // 0. Rule-based shortcut
    const ruleCategory = ruleBasedCategory(email);
    if (ruleCategory) {
        console.log(`✅ Rule-based category: ${ruleCategory} for subject "${email.subject}"`);
        return ruleCategory;
    }

    // email = {subject, from, body, snippet}
    const content = email.body || email.snippet || '';

    // 1. Basic fallback 
    if(!content && !email.subject) return 'General';

    // 2. Prepare the prompt 
    // We keep the email short to save the processing time 
    const text = (email.subject || '') + '\n\n' + content;
    const snippet = text.substring(0,600).replace(/\s+/g, ' ');

    const prompt = `
You are an email classifier for a personal inbox.

You must classify this email into EXACTLY ONE of these categories:
- Interested
- Not Interested
- Meeting Booked
- Spam
- General

DEFINITIONS:
- Interested:
    - The sender is clearly interested in the user.
    - Examples: interview invite, "we would like to talk", "we are impressed", "we want to proceed", "let's schedule a call".
    - Emails announcing an online test, assessment date, or exam schedule 
    (e,g., "Test to be conducted on 27th Nov", "Your assessment is scheduled") are ALWAYS "Interested".
- Not Interested:
    - Clear rejection or negative decision.
    - Examples: "we have decided not to move forward", "unfortunately", "we went with other candidates", "not a fit right now".
- Meeting Booked:
    - A specific meeting time/date is CONFIRMED or a calendar invite is sent.
- Spam:
    - Marketing emails, promotions, newsletters, discount offers, bulk campaigns.
    - Job boards sending generic job listings or newsletters are Spam.
    - DO NOT use Spam for system or product notifications exam/test registrations, coding test details, or application status updates.
- General:
    - Notifications, connection requests, message notifications, verification codes, password reset, email confirmations, neutral updates, system/dev alerts, exam or test registrations.

IMPORTANT SPECIAL CASES:
- Emails with verification codes or email confirmation links (like Amazon OTP, Hugging Face confirmation) are ALWAYS "General", NEVER "Spam".
- LinkedIn message or connection notifications without clear marketing are "General".
- Slack notifications, ThreadWise Bot emails, MongoDB Atlas cluster alerts, or other infra/system emails are "General", not Spam.
- When you are unsure, prefer "General" instead of "Spam".

EXAMPLES (study carefully):

Example 1:
Subject: Your amazon.jobs verification code
Body: "YOUR AMAZON.JOBS VERIFICATION CODE ... This code will be active for 10 minutes..."
Correct category: General

Example 2:
Subject: [Hugging Face] Click this link to confirm your email address
Body: "Confirm your email address by clicking on this link..."
Correct category: General

Example 3:
Subject: New jobs: Lead - Full Stack Engineer at Finovant and 6 more jobs
Body: "Hi Aaditya! I've found 7 new jobs that might interest you!"
Correct category: Spam

Example 4:
Subject: Regarding your application to Cohesity
Body: "Thank you for applying ... unfortunately we will not move forward..."
Correct category: Not Interested

Example 5:
Subject: Aaditya - Share feedback on your application process with Cohesity
Body: "We would love to hear your feedback on our application process..."
Correct category: General

Example 6:
Subject: Nikeet just messaged you
Body: "You have 2 new messages"
Correct category: General

Example 7:
Subject: Update: iqigai.ai by fractal | Registration | Test to be conducted on 27th Nov 2025
Body: "Registration and test details..."
Correct category: General

Example 8:
Subject: Your MongoDB Atlas M0 cluster will be automatically paused in 7 days
Body: "Your free cluster will be paused unless..."
Correct category: General

Example 9:
Subject: ThreadWise Bot on Slack: New Account Details
Body: "Your new account has been created..."
Correct category: General

Example 10:
Subject: Update: iqigai.ai by fractal | Registration | Test to be conducted on 27th Nov 2025
Body: "Your test is scheduled..."
Correct category: Interested

Now classify THIS email.

EMAIL:
Subject: ${email.subject || '(no subject)'}
From: ${email.from || '(unknown)'}
Content: ${snippet}

RULES FOR ANSWER:
- Respond with ONLY ONE WORD from this list: Interested, Not Interested, Meeting Booked, Spam, General
- No extra text, no punctuation, no explanation.

Answer:
    `.trim();

    try{
        // 3. Call local Ollama instance
        const response = await axios.post('http://127.0.0.1:11434/api/generate', {
            model: 'llama3.2',  // Or 'mistral' or whatever model you pulled
            prompt,
            stream: false // We want the whole answer at once, not piece by piece
        });

        // 4. Clean the result 
        // Sometimes models add extra spaces or punctuation
        const rawAnswer = (response.data.response || '').trim();

        // Ensure answer is of our valid categories
        const validCategories = ['Interested', 'Not Interested', 'Meeting Booked', 'Spam', 'General'];
        const normalized = rawAnswer.toLowerCase();

        // Simple check : Does the answer contain one of our keyword?
        const bestMatch = validCategories.find(
            cat => normalized === cat.toLowerCase() || normalized.includes(cat.toLowerCase())
        );

        const finalLabel = bestMatch || 'General';

        console.log(`🤖 AI Categorized as: ${finalLabel} (raw: "${rawAnswer}")`);
        return finalLabel;
    }
    catch(error){
        console.error('Ai Service Error FULL:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });

        // Fallback if Ollama isn't running
        return 'General';
    }
}

module.exports = {categorizeEmail};

/* --------------------- Using Remote api key ----------------------------
/*
const categorizeEmail = async (content) => {
    // If content is empty or too short return general
    if(!content || content.length < 10) return 'General';

    // We truncate the email to the first 500 chars
    // Because free api models have i/p limits and we only need the start to guess the content
    const textToAnalyze = content.substring(0, 500);

    const API_URL = 'https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli';

    try{
        const response = await axios.post(
            API_URL,
            {
                inputs: textToAnalyze,
                parameters: {
                    candidate_labels: ['Interested', 'Not Interested', 'Meeting Booked', 'Spam', 'General'],
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // The API return the scores for all the labels, but we will take the one with the highest score
        // Response structure: { labels: [...], scores: [...] }
        // const bestLabel = response.data[0].labels[0];

         // New router response format: array of { label, score }
        const bestLabel = Array.isArray(response.data) ? response.data[0].label : response.data.label || 'General';
        console.log(`AI Categorized as: ${bestLabel}`);
        return bestLabel;
    }
    catch(error){
        console.error('Ai Service Error FULL:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });

        // If the app fails (e.g. rate limit), fallback to 'General' so the app doesn't crash
        return 'General';
    }
};

*/

