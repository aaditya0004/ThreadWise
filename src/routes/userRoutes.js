const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const router = express.Router();
const {registerUser, loginUser, getMe} = require("../controllers/userController");
const {protect} = require("../middlewares/authMiddleware");

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Google OAuth Routes

// 1. The Trigger Route
// When user hits this, we tell Passport to start the Google authentication flow
// Scope tells Google: "We want the user's profile and email"
router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

// 2. The Callback Route
// Google redirects here after the user says "Yes"
router.get(
    '/auth/google/callback',
    passport.authenticate('google', {session: false, failureRedirect: '/login'}),
    (req, res) => {
        // if we get here then user is authencticated
        // req.user contains the user found or created in our passport config

        // Generate a token for them 
        const token = generateToken(req.user._id);

        /* res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            token: token,
            message: "Login Successful! Copy this token"
        }); */

        // Redirect Back to Frontend
        // We pass the token in the URL query string so the frontend can grab it 
        res.redirect(`http://localhost:5173/login?token=${token}`);
    }
);

module.exports = router;