const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bankName: {
        type: String,
        required: true,
    },
    accountType:{
        type: String,
        required: true
    },
    accountNumber:{
        type: String,
        unique: true,
        required: true
    },
    currentBalance: {
        type: Number,
        required: true,
        default: 0,
    }
}, {timestamps: true})

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;