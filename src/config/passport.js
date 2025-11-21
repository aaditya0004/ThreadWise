const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const { access } = require('fs');

// Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/users/auth/google/callback',
        },
        async(accessToken, refreshToken, profile, done) => {
            try{
                let user = await User.findOne({email: profile.emails[0].value});

                //user exist
                if(user){
                    if(!user.googleId){
                        user.googleId = profile.id;
                        await user.save();
                    }

                    return done(null, user);
                }

                //user doesnt exist 
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                });

                return done(null, user);
            }
            catch(error){
                return done(error, null);
            }
        }
    )
);