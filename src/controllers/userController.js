const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper fn to generate a JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

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
};