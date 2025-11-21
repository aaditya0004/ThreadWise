const { timeStamp } = require('console');
const mongoose = require('mongoose');

const connectedAccountSchema = mongoose.Schema(
    {
        // This links the account to a specific user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true, 
            ref: 'User',   // Refers to the user Model
        },
        email: {
            type: String,
            required: true,
        },
        // We will Store the ENCRYPTED App Password here
        imapPassword: {
            type: String,
            required: true,
        },
        imapHost: {
            type: String,
            required: true,
        }, 
        imapPort: {
            type: Number,
            default: 993,
        },
        tls: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const ConnectedAccount = mongoose.model('ConnectedAccount', connectedAccountSchema);

module.exports = ConnectedAccount;