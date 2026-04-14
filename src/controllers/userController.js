const { esClient } = require('../config/elasticsearch');
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");


// @desc    Register a new User
// @route   POST /api/users/register
// @access  Public

const registerUser = async (req, res) => {
    // get the name, email, password from the req body
    const { name, email, password } = req.body;

    // validate all fields sent
    if(!name || !email || !password){
        res.status(400).json({message: "Please add all fields"});
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 6 characters and include uppercase, lowercase, and a number"
        });
    }

    // checks if a user with that email already exist
    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400).json({message: "User already exists"});
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in the DB
    const user = await User.create({
        name, 
        email, 
        password: hashedPassword,
    });

    // IF user created successfully, send back user data and a token
    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }else{
        res.status(400).json({message: "Invalid User data"});
    }
};

// @desc    Authenticates a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    // Get email and password from the req body
    const {email, password} = req.body;

    // find the user by email
    const user = await User.findOne({email});

    // check if user exists and compare the plain text password with the hashed password;
    if(user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }else{
        // if they dont match, send an error
        res.status(400).json({message: "Invalid Credentials"});
    }
};

// @desc    Update User Custom Email Rules
// @route   PUT /api/users/rules
// @access  Private
const updateUserRules = async (req, res) => {
    const { interestedKeywords, spamKeywords } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update rules in DB
        user.customRules.interestedKeywords = interestedKeywords || user.customRules.interestedKeywords;
        user.customRules.spamKeywords = spamKeywords || user.customRules.spamKeywords;

        const updatedUser = await user.save();

        // RETROACTIVE UPDATE: Re-classify the last 50 emails in Elasticsearch
        // We do a quick keyword scan over existing emails so the UI updates instantly.
        try {
            const recentEmails = await esClient.search({
                index: 'emails',
                body: {
                    query: { term: { userId: req.user.id } },
                    size: 50,
                    sort: [{ date: { order: 'desc' } }]
                }
            });

            const hits = recentEmails.hits.hits;
            const rules = updatedUser.customRules;

            // Simple helper to check keywords
            const containsKeyword = (text, keywordString) => {
                if (!keywordString) return false;
                const keywords = keywordString.split(',').map(k => k.trim().toLowerCase());
                return keywords.some(keyword => text.includes(keyword));
            };

            for (const hit of hits) {
                const source = hit._source;
                const fullText = `${source.subject} ${source.from} ${source.body}`.toLowerCase();
                
                let newCategory = 'General'; // Default fallback

                // Apply new custom rules
                if (containsKeyword(fullText, rules.interestedKeywords)) {
                    newCategory = 'Interested';
                } else if (containsKeyword(fullText, rules.spamKeywords)) {
                    newCategory = 'Spam';
                } else if (source.category === 'Meeting Booked' || source.category === 'Not Interested') {
                     // Preserve AI specific categories that aren't rule-based
                    newCategory = source.category;
                }

                // Update Elasticsearch document if the category changed
                if (newCategory !== source.category) {
                    await esClient.update({
                        index: 'emails',
                        id: hit._id,
                        body: { doc: { category: newCategory } }
                    });
                }
            }
        } catch (esError) {
            console.log("Failed to retroactively update emails in ES", esError);
            // We don't fail the whole request if ES update fails
        }

        res.json({
            message: "Rules updated and applied to recent emails!",
            customRules: updatedUser.customRules
        });
    } catch (error) {
        res.status(500).json({ message: "Server error updating rules" });
    }
};

// @desc    Get User data
// @route   GET /api/users/me
// @access  Private
const getMe = async(req, res) => {
    // the user object is attached to the request in the 'protect' middleware
    res.status(200).json(req.user);
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserRules,
};