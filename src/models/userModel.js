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
},
{
    timestamps: true,
});


const User = mongoose.model("User", userSchema);

module.exports = User;