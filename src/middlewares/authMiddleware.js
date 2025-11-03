const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async(req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            // Get token from header
            token = req.headers.authorization.split(' ')[1];  // "Bearer TOKEN" -> "TOKEN"

            // Verify the token using our secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get the user from the token's ID and attach it to the req object 
            // we exclude the password from the user object we attach
            req.user = await User.findById(decoded.id).select('-password');

            // call the next middleware or controller
            next();
        }
        catch(error){
            console.error(error);
            res.status(401).json({message: "Not authorized, token failed"});
        }
    }

    if(!token){
        res.status(401).json({message: "Not authorized, No token"});
    }
};

module.exports = { protect };
