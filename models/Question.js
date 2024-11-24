const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },  
    optionA: {
        type: String,
        required: true,
    },
    optionB: {
        type: String,
        required: true,
    },
    optionC: {
        type: String,
        required: true,
    },
    optionD: {
        type: String,
        required: true,
    },
    rightAnswer:{
        type:String,
        required: true
    }
   
}, {timestamps: true})

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;