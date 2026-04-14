const axios = require('axios');

// Helper to check if any comma-separated keywords exist in the text
const containsKeyword = (text, keywordString) => {
    if (!keywordString) return false;
    const keywords = keywordString.split(',').map(k => k.trim().toLowerCase());
    return keywords.some(keyword => text.includes(keyword));
};

// Now accepts userRules as the second argument
const ruleBasedCategory = (email, userRules) => {
    const subject = (email.subject || '').toLowerCase();
    const from = (email.from || '').toLowerCase();
    const body = (email.body || email.snippet || '').toLowerCase();
    const fullText = `${subject} ${from} ${body}`;

    // 0) Assessment / online test invited → Interested
    /* if (
        subject.includes('test') ||
        subject.includes('assessment') ||
        subject.includes('online test') ||
        subject.includes('coding test') ||
        subject.includes('conducted on') ||
        subject.includes('exam') ||
        subject.includes('registration') && subject.includes('test')
    ) {
        return 'Interested';
    } */

    // CUSTOM User "Interested" Rules
    if (containsKeyword(fullText, userRules.interestedKeywords)) {
        return 'Interested';
    }

    // 1) OTP / verification / email confirmation => General
    if (
        fullText.includes('verification code') ||
        fullText.includes('confirm your email') ||
        fullText.includes('one-time password') ||
        fullText.includes('verification code') ||
        fullText.includes('password reset') ||
        fullText.includes('share feedback') ||
        fullText.includes('satisfaction survey') ||
        fullText.includes('satisfaction survey') ||
        fullText.includes('otp')
    ) {
        return 'General';
    }

/*     // 3) Job board newsletters / campaigns => Spam
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
    } */

    // CUSTOM User "Spam" Rules
    if (containsKeyword(fullText, userRules.spamKeywords)) {
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

// Now accepts userRules as the second argument
const categorizeEmail = async (email, userRules) => {
    // 0. Rule-based shortcut
    const ruleCategory = ruleBasedCategory(email, userRules);
    if (ruleCategory) {
        console.log(`✅ Custom Rule matched: ${ruleCategory} for "${email.subject}"`);
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
Classify this email into EXACTLY ONE of these categories: Interested, Not Interested, Meeting Booked, Spam, General.

USER'S CUSTOM DEFINITIONS:
- Interested: Any email containing concepts related to: ${userRules.interestedKeywords}.
- Spam: Any email containing concepts related to: ${userRules.spamKeywords}.
- Not Interested: Clear rejections.
- Meeting Booked: Calendar invites or confirmed meeting times.
- General: Everything else (receipts, notifications, OTPs, standard updates).


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

