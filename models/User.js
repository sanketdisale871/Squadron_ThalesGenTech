const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        validate: [isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required : true
    },
    phone: {
        type: String,
        required: true,
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Family"
    },
    occupation: {
        type: String,
        required: true,
    },
    annualIncome: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
    }],
    financeHealthScore: Number,
    creditFitnessScore: Number,
    goals:[{
        name: {type: String, required: true},
        goalType: {type: String, required: true},
        targetAmount: {type: Number, required: true},
        // currentAmount: {type: Number},
        dueDate: {type: Date, required: true},
        createdAt: {type: Date, default: Date.now()}
    }],
    investments:[{
        investmentType: {type: String, required: true},
        amount: {type: Number, required: true},
        maturityDate: {type: Date},
        investedDate: {type: Date, required: true, default: Date.now()}
    }],
    coins:{
        type: Number,
        default: 0
    },
    expenseCategories:[{type: String}],
    expenses: [{
        expenseType:{type: String, required: true},
        expenseAmount: {type: Number, required: true},
        vendor: {type: String, required: true},
        note: {type: String},
        category: {type:String},
        expenseDate: {type:Date, required: true}
    }],
    liabilities:[{
        liabilitiesType: {type: String, required: true},
        bank:{type: String, required: true},
        outstandingAmount: {type: Number, required: true},
        emi: {type: Number, required: true},
        intrestRate: {type: Number, required: true},
        dueDate: {type: Date, required:true},
    }],
    insurance: [{
        insuranceType: {type: String, required: true},
        provider: {type: String, required: true},
        sumAssured: {type: Number, required: true},
        premium: {type: Number, required: true},
        termYears: {type: Number, required: true},
    }],
    taxDetails:{
        panNumber: {type: String},
        lastFilingYear: {type: Number},
        totalTaxPaid: {type: Number},
    },
    courseSequence:[{
        courseId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }  
    }]
}, {timestamps: true})

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
    //   const auth = password == client.password;
      if (auth) {
        return user;
      }
    //   throw Error('incorrect password');
        return null
    }
    // throw Error('incorrect email');
    return null
  };
  


const User = mongoose.model('User', userSchema);

module.exports = User;