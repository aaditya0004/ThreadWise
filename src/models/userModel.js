const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
    },
    password: {
        type: String,
        // required: true,
    },
    googleId: {
        type: String,
        unique: true, 
        sparse: true, // sparse allows multiple users to have no googleId (null) without error
    },

    // For Custom AI rules;
    customRules: {
        interestedKeywords: { 
            type: String, 
            default: "interview, assessment, coding test, offer, shortlist" 
        },
        spamKeywords: { 
            type: String, 
            default: "newsletter, marketing, promotional, unsubscribe, digest" 
        }
    }
},
{
    timestamps: true,
});


const User = mongoose.model("User", userSchema);

module.exports = User;