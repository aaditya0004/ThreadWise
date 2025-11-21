// Import Express
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();             // Configure dotenv
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const passport = require('passport');
require('./config/passport');
const accountRoutes = require('./routes/accountRoutes');


// Connect to DB
connectDB();

// Initialize the Express app
const app = express();
// This is a middleware that allows our app to parse JSON from the request body
app.use(express.json());
app.use(passport.initialize());
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);



// Define the Port
const PORT = 5000;

// Create a basic route 
// This tells our server how to respond when someone visits the main URL
app.get('/', (req, res) => {
    res.send("API is running.....");
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});