const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    goals: [{
        name: {type: String, required: true},
        goalType: {type: String, required: true},
        targetAmount: {type: Number, required: true},
        // currentAmount: {type: Number},
        dueDate: {type: Date, required: true},
        createdAt: {type: Date, default: Date.now()}
    }],

}, {timestamps: true})

const Family = mongoose.model('Family', familySchema);

module.exports = Family;