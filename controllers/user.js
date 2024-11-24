const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
const Family = require("../models/Family");
// create json web token
const maxAge = 1000 * 365 * 24 * 60 * 60;
const createUserToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: maxAge,
  });
};

// POST /api/register
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      repassword,
      phone,
      occupation,
      annualIncome,
      currency,
      country,
      dob,
    } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !occupation ||
      !annualIncome ||
      !currency ||
      !country ||
      !dob
    ) {
      return res.render("register", { errMsg: "Invalid request!" });
    }
    if (password !== repassword) {
      return res.render("register", {
        errMsg: "Password & Confirm Password not match!",
      });
    }
    await User.init(); // Ensure indexes are built before creating a new user

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds value

    const new_user = new User({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      phone,
      occupation,
      annualIncome: parseFloat(annualIncome),
      currency,
      country,
      dob: new Date(dob),
      expenseCategories: ["Fixed", "Variable"],
    });

    await new_user.save(); // Save the new user and wait for the result

    // If login is successful, generate a token
    const token = createUserToken(new_user._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("register", { errMsg: err.message });
  }
};

// POST /api/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);

    // If login is successful, generate a token
    const token = createUserToken(user._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
};

const addAccount = async (req, res) => {
  const userId = req.userId;
  try {
    const { bankName, accountNumber, accountType } = req.body;
    if (!bankName || !accountNumber || !accountType) {
      return res.redirect("/");
    }

    await Account.init(); // Ensure indexes are built before creating a new user

    // Hash the password before saving
    const currentBalance =
      Math.floor(Math.random() * (3000000 - 100000 + 1)) + 100000;
    const user_account = new Account({
      userId,
      accountNumber,
      bankName,
      currentBalance,
      accountType,
    });

    // Save the new account and wait for the result
    const savedAccount = await user_account.save();

    // Push the new account's id to the user's accounts array
    await User.findByIdAndUpdate(userId, {
      $push: { accounts: savedAccount._id },
    });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const addInvestment = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  try {
    // Destructure investment details from the request body
    const { investmentType, amount, maturityDate, investedDate } = req.body;

    // Check if required fields are provided
    if (!investmentType || !amount || !investedDate || !maturityDate) {
      return res.redirect("/");
    }

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.render("login", { errMsg: "User not found" });
    }

    // Add the new investment to the user's investments array
    const newInvestment = {
      investmentType,
      amount: parseFloat(amount), // Ensure amount is a number
      maturityDate: maturityDate ? new Date(maturityDate) : null, // Optional, check if provided
      investedDate: new Date(investedDate), // Parse the date for investedDate
    };

    user.investments.push(newInvestment); // Push the new investment to the user's investments array

    // Save the updated user document
    await user.save();

    // Redirect to home or some other page
    res.redirect("/investments");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const addGoal = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  try {
    // Destructure investment details from the request body
    const { name, goalType, targetAmount, dueDate } = req.body;

    // Check if required fields are provided
    if (!name || !goalType || !targetAmount || !dueDate) {
      return res.redirect("/goals");
    }

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.render("login", { errMsg: "User not found" });
    }

    // Add the new investment to the user's investments array
    const newGoal = {
      name,
      goalType,
      targetAmount: parseFloat(targetAmount), // Ensure amount is a number
      dueDate: new Date(dueDate), // Parse the date for investedDate
    };

    user.goals.push(newGoal); // Push the new investment to the user's investments array

    // Save the updated user document
    await user.save();

    // Redirect to home or some other page
    res.redirect("/goals");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const addExpense = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  try {
    // Destructure investment details from the request body
    const { expenseAmount, category, vendor, expenseType, expenseDate, note } =
      req.body;

    // Check if required fields are provided
    if (
      !expenseAmount ||
      !category ||
      !vendor ||
      !expenseType ||
      !expenseDate ||
      !note
    ) {
      return res.redirect("/expenses");
    }

    // Find the user by userId
    const user = await User.findById(userId);

    // Add the new investment to the user's investments array
    const newExpense = {
      expenseAmount: parseFloat(expenseAmount),
      category,
      expenseType,
      expenseDate: new Date(expenseDate),
      note,
      vendor,
    };

    user.expenses.push(newExpense); // Push the new investment to the user's investments array

    // Save the updated user document
    await user.save();

    // Redirect to home or some other page
    res.redirect("/expenses");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const addLiabilities = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  try {
    // Destructure investment details from the request body
    const {
      liabilitiesType,
      bank,
      outstandingAmount,
      emi,
      intrestRate,
      dueDate,
    } = req.body;

    // Check if required fields are provided
    if (
      !liabilitiesType ||
      !bank ||
      !outstandingAmount ||
      !emi ||
      !intrestRate ||
      !dueDate
    ) {
      return res.redirect("/liabilities");
    }

    // Find the user by userId
    const user = await User.findById(userId);

    // Add the new investment to the user's investments array
    const newLiabilities = {
      liabilitiesType,
      bank,
      outstandingAmount: parseFloat(outstandingAmount),
      emi: parseFloat(emi),
      intrestRate: parseFloat(intrestRate),
      dueDate: new Date(dueDate),
    };

    user.liabilities.push(newLiabilities); // Push the new investment to the user's investments array

    // Save the updated user document
    await user.save();

    // Redirect to home or some other page
    res.redirect("/liabilities");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderDashboard = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("accounts").exec();
    let totalBalance = 0;
    let totalInvested = 0;
    for (let i = 0; i < user.accounts.length; i++) {
      totalBalance += user.accounts[i].currentBalance;
    }
    for (let i = 0; i < user.investments.length; i++) {
      totalInvested += user.investments[i].amount;
    }
    if (user) {
      return res.render("vigiSafeDashboard", {
        user,
        totalBalance,
        totalInvested,
      });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const addFamily = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  try {
    // Destructure family name from the request body
    const { name } = req.body;

    // Check if required fields are provided
    if (!name) {
      return res.redirect("/family");
    }

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.render("login", { errMsg: "User not found" });
    }

    // Check if the user is already part of a family
    if (user.familyId) {
      return res.render("login", {
        errMsg: "You already are part of a family",
      });
    }

    // Create a new family
    const newFamily = new Family({
      name,
      members: [userId], // Add the current user as the first member of the family
    });

    // Save the family
    const savedFamily = await newFamily.save();

    // Update the user's familyId to the new family's ID
    user.familyId = savedFamily._id;
    await user.save();

    // Redirect to goals or a success page
    res.redirect("/family");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const joinFamily = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  const { familyId } = req.body; // The family ID passed in the request body
  console.log(familyId);

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.render("login", { errMsg: "User not found" });
    }

    // Check if the user is already part of a family
    if (user.familyId) {
      return res.render("login", {
        errMsg: "User is already part of a family",
      });
    }

    // Find the family by ID
    const family = await Family.findById(familyId);
    if (!family) {
      return res.render("login", { errMsg: "Family not found" });
    }

    // Check if the user is already a member of the family
    const isAlreadyMember = family.members.some((memberId) =>
      memberId.equals(userId)
    );

    if (isAlreadyMember) {
      return res.redirect("/family");
    }

    // Add the user to the family's members array
    family.members.push(userId);
    await family.save();

    // Update the user's familyId to the joined family
    user.familyId = family._id;
    await user.save();

    // Redirect to a success page (e.g., family or goals page)
    res.redirect("/family");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const addFamilyGoal = async (req, res) => {
  const userId = req.userId; // Assumes that userId is available from authentication middleware
  const { name, goalType, targetAmount, dueDate } = req.body; // Destructure goal details from the request body
  const { familyId } = req.params; // Get familyId from request parameters

  try {
    // Validate required fields
    if (!name || !goalType || !targetAmount || !dueDate) {
      return res.redirect("/family");
    }

    // Find the family by familyId
    const family = await Family.findById(familyId);

    if (!family) {
      return res.render("login", { errMsg: "Family not found" });
    }

    // Check if the user is a member of the family
    const isMember = family.members.some((memberId) => memberId.equals(userId));

    if (!isMember) {
      return res.render("login", {
        errMsg: "You must be a member of the family to add a goal",
      });
    }

    // Add the new goal to the family's goals array
    const newGoal = {
      name,
      goalType,
      targetAmount,
      dueDate: new Date(dueDate), // Ensure dueDate is stored as a Date object
    };

    family.goals.push(newGoal);

    // Save the family with the new goal
    await family.save();

    // Redirect or send success response
    res.redirect("/family"); // Redirect to a goals page or any other appropriate page
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const deleteFamilyGoal = async (req, res) => {
  const userId = req.userId; // Assuming userId is available from authentication middleware
  const { familyId, goalId } = req.params; // Assuming familyId and goalId are in request params

  try {
    // Find the family by ID
    const family = await Family.findById(familyId);

    if (!family) {
      return res.redirect("/family");
    }

    // Check if the user is a member of the family
    const isMember = family.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      return res.render("login", {
        errMsg: "You are not a member of this family",
      });
    }

    // Find the goal within the family goals
    const goalIndex = family.goals.findIndex(
      (goal) => goal._id.toString() === goalId
    );

    if (goalIndex === -1) {
      return res.redirect("/family");
    }

    // Remove the goal from the family goals array
    family.goals.splice(goalIndex, 1);

    // Save the family document
    await family.save();

    return res.redirect("/family");
  } catch (err) {
    console.log(err);
    return res.render("login", { errMsg: err.message });
  }
};

const renderFamily = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId)
      .populate(["accounts", "familyId"])
      .exec();
    if (user) {
      let family = undefined;
      if (user.familyId) {
        family = await Family.findById(user.familyId)
          .populate({
            path: "members",
            populate: {
              path: "accounts",
              model: "Account",
            },
          })
          .exec();
        for (let i = 0; i < family.goals.length; i++) {
          let currentAmount = 0;
          for (let j = 0; j < family.members.length; j++) {
            for (let k = 0; k < family.members[j].investments.length; k++) {
              if (
                family.goals[i].goalType ===
                family.members[j].investments[k].investmentType
              ) {
                currentAmount += family.members[j].investments[k].amount;
              }
            }
          }
          currentAmount =
            currentAmount > family.goals[i].targetAmount
              ? family.goals[i].targetAmount
              : currentAmount;
          family.goals[i].currentAmount = currentAmount;
          family.goals[i].completedPercent = (
            (currentAmount / family.goals[i].targetAmount) *
            100
          ).toFixed(2);
        }
      }
      return res.render("family", { user, family });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderInvestment = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("accounts").exec();
    let totalInvested = 0;
    let nextMaturity = null;
    // user.investments = []
    for (let i = 0; i < user.investments.length; i++) {
      if (new Date(user.investments[i].maturityDate) < new Date()) {
        user.investments[i].status = "Matured";
      } else {
        user.investments[i].status = "Active";
      }
    }
    // Sort investments by status
    user.investments.sort((a, b) => {
      if (a.status === "Matured" && b.status === "Active") {
        return 1; // Place 'Matured' before 'Active'
      }
      if (a.status === "Active" && b.status === "Matured") {
        return -1; // Place 'Active' after 'Matured'
      }
      return 0; // If they have the same status, leave them unchanged
    });
    const monthWiseInvestment = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < user.investments.length; i++) {
      totalInvested += user.investments[i].amount;
      monthWiseInvestment[user.investments[i].investedDate.getMonth()] +=
        user.investments[i].amount;
      if (user.investments[i].status === "Active") {
        if (nextMaturity) {
          if (nextMaturity > new Date(user.investments[i].maturityDate)) {
            nextMaturity = new Date(user.investments[i].maturityDate);
          }
        } else {
          nextMaturity = new Date(user.investments[i].maturityDate);
        }
      }
    }

    const totalReturns = totalInvested * 0.2 + totalInvested;
    if (user) {
      return res.render("investment", {
        user,
        totalInvested,
        totalReturns,
        nextMaturity,
        monthWiseInvestment,
      });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderGoals = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("accounts").exec();
    for (let i = 0; i < user.goals.length; i++) {
      let currentAmount = 0;
      for (let j = 0; j < user.investments.length; j++) {
        if (user.goals[i].goalType === user.investments[j].investmentType) {
          currentAmount += user.investments[j].amount;
        }
      }
      user.goals[i].currentAmount =
        currentAmount < user.goals[i].targetAmount
          ? currentAmount
          : user.goals[i].targetAmount;
      user.goals[i].completedPercent =
        100 * (user.goals[i].currentAmount / user.goals[i].targetAmount);
    }
    if (user) {
      return res.render("goals", { user });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderLearnings = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("accounts").exec();

    if (user) {
      return res.render("learnings", { user });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const deleteGoal = async (req, res) => {
  const userId = req.userId; // Ensure the userId is extracted from the auth middleware
  const goalType = req.params.goalType; // Get the goalType from the URL params

  try {
    const user = await User.findById(userId);

    // Filter out the goal that matches the goalType
    const goalIndex = user.goals.findIndex(
      (goal) => goal.goalType === goalType
    );

    if (goalIndex === -1) {
      return res.redirect("/goals");
    }

    // Remove the goal from the array
    user.goals.splice(goalIndex, 1);

    // Save the user document after modification
    await user.save();
    res.redirect("/goals");
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderLogin = async (req, res) => {
  res.render("login", { errMsg: null });
};
const renderRegister = async (req, res) => {
  res.render("register", { errMsg: null });
};

// const renderChat = async (req, res) => {
//   res.render("chat_updated", { User });
// };

const renderChat = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (user) {
      return res.render("chat_updated", { user });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const predictAttack = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (user) {
      return res.render("predictAttack", { user });
    }
    return res.render("login", { errMsg: "Account not found!" });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderExpenses = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate({
      path: "familyId",
      populate: { path: "members" }, // Populating members within familyId
    });
    let totalPersonalExpense = 0;
    const expenseTypeMap = {};
    const monthlyExpenditure = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < user.expenses.length; i++) {
      totalPersonalExpense += user.expenses[i].expenseAmount;
      monthlyExpenditure[new Date(user.expenses[i].expenseDate).getMonth()] +=
        user.expenses[i].expenseAmount;
      if (expenseTypeMap[user.expenses[i].expenseType]) {
        expenseTypeMap[user.expenses[i].expenseType] +=
          user.expenses[i].expenseAmount;
      } else {
        expenseTypeMap[user.expenses[i].expenseType] =
          user.expenses[i].expenseAmount;
      }
    }

    const expenseLabelArr = [];
    const expenseLabelAmountArr = [];
    for (const label in expenseTypeMap) {
      expenseLabelArr.push(label);
      expenseLabelAmountArr.push(expenseTypeMap[label]);
    }

    let totalFamilyExpense = 0;
    if (user.familyId) {
      for (let i = 0; i < user.familyId.members.length; i++) {
        for (let j = 0; j < user.familyId.members[i].expenses.length; j++) {
          totalFamilyExpense +=
            user.familyId.members[i].expenses[j].expenseAmount;
        }
      }
    } else {
      totalFamilyExpense = totalPersonalExpense;
    }

    return res.render("expenses", {
      user,
      totalPersonalExpense,
      totalFamilyExpense,
      expenseLabelArr,
      expenseLabelAmountArr,
      monthlyExpenditure,
    });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};
const vigiSafeDashboard = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate({
      path: "familyId",
      populate: { path: "members" }, // Populating members within familyId
    });

    return res.render("vigiSafeDashboard", {
      user,
    });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

const renderLiabilities = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate({
      path: "familyId",
      populate: { path: "members" },
    });
    let totalPersonalLiabilities = 0;
    const liabilitiesTypeMap = {};
    const monthlyLiabilities = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < user.liabilities.length; i++) {
      totalPersonalLiabilities += user.liabilities[i].outstandingAmount;
      if (new Date(user.liabilities[i].dueDate) < new Date()) {
        user.liabilities[i].status = "Paid";
      } else {
        user.liabilities[i].status = "Pending";
      }
      monthlyLiabilities[new Date(user.liabilities[i].dueDate).getMonth()] +=
        user.liabilities[i].outstandingAmount;
      if (liabilitiesTypeMap[user.liabilities[i].liabilitiesType]) {
        liabilitiesTypeMap[user.liabilities[i].liabilitiesType] +=
          user.liabilities[i].outstandingAmount;
      } else {
        liabilitiesTypeMap[user.liabilities[i].liabilitiesType] =
          user.liabilities[i].outstandingAmount;
      }
    }

    const liabilitiesLabelArr = [];
    const liabilitiesLabelAmountArr = [];
    for (const label in liabilitiesTypeMap) {
      liabilitiesLabelArr.push(label);
      liabilitiesLabelAmountArr.push(liabilitiesTypeMap[label]);
    }

    let totalFamilyliabilities = 0;
    if (user.familyId) {
      for (let i = 0; i < user.familyId.members.length; i++) {
        for (let j = 0; j < user.familyId.members[i].liabilities.length; j++) {
          totalFamilyliabilities +=
            user.familyId.members[i].liabilities[j].outstandingAmount;
        }
      }
    } else {
      totalFamilyliabilities = totalPersonalLiabilities;
    }

    return res.render("liabilities", {
      user,
      totalPersonalLiabilities,
      totalFamilyliabilities,
      liabilitiesLabelArr,
      liabilitiesLabelAmountArr,
      monthlyLiabilities,
    });
  } catch (err) {
    console.log(err);
    res.render("login", { errMsg: err.message });
  }
};

// ::::::::::::::::::::::;;;; Chat bot start;;;;;;;;::::::::::::
const { ChatGroq } = require("@langchain/groq");
const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

// Initialize Pinecone
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = "semtech-gpt";
const index = pc.index(indexName);

// Initialize ChatGroq
const llm = new ChatGroq({
  model: "llama-3.1-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
});

// Function to get embeddings from a prompt
async function getEmbeddings(prompt) {
  const model = "multilingual-e5-large"; // Your model here
  const embeddings = await pc.inference.embed(model, [prompt], {
    inputType: "query",
  });
  return embeddings[0].values; // Return the embedding vector
}

// Function to query the Pinecone index
async function queryPinecone(embedding) {
  const queryResponse = await index.namespace("main-citi-site").query({
    topK: 3,
    vector: embedding,
    includeValues: false,
    includeMetadata: true,
  });

  return queryResponse.matches; // Return the matched documents
}

// Function to invoke the ChatGroq API with LLM
async function invokeChatGroq(messages) {
  const aiMsg = await llm.invoke(messages);
  return aiMsg; // Return the response from LLM
}

// Chatbot class to manage conversation state
class FinancialChatbot {
  constructor() {
    this.messages = [];
    this.turnLimit = 5; // Limit to last 5 turns
  }

  // Add message to the conversation
  addMessage(role, content) {
    this.messages.push({ role, content });
    // Maintain only the last 'turnLimit' messages
    if (this.messages.length > this.turnLimit) {
      this.messages.shift(); // Remove the oldest message
    }
  }

  // Main function to handle user query
  async handleUserQuery(userData, userPrompt) {
    // Get embeddings for the user prompt
    const embedding = await getEmbeddings(userPrompt);

    // Query the Pinecone index for relevant documents
    const references = await queryPinecone(embedding);

    // Prepare messages for LLM including references
    const referenceContent = references.map((ref) => ref.metadata).join("\n"); // Combine reference metadata into a string
    const messages = [
      {
        role: "system",
        content:
          "You are a personal AI assitant to help the user to mitigate their cyber attacks.Guide users, Don't give any unnecessary information.",
      },
      {
        role: "system",
        content: JSON.stringify(userData),
      },
      { role: "system", content: this.messages.toString() },
      { role: "user", content: userPrompt },
      { role: "system", content: `References:\n${referenceContent}` },
    ];

    // Invoke ChatGroq API to get response from LLM
    const llmResponse = await invokeChatGroq(messages);
    const ans = llmResponse.content;

    // Add user and assistant messages to the conversation
    this.addMessage("user", userPrompt);
    this.addMessage("assistant", ans);

    // Construct the final response
    return {
      response: ans,
      references: references.map((ref) => ref.metadata), // Return references as well
    };
  }
}

const chatbot = new FinancialChatbot();

const getResponse = async (req, res) => {
  const userId = req.userId;
  const { userPrompt } = req.body;

  try {
    // Fetch user data and populate related fields
    // const userFinancialData = await User.findById(userId)
    //   .populate([
    //     { path: "accounts" },
    //     {
    //       path: "familyId",
    //       populate: { path: "members" }, // Populating members within familyId
    //     },
    //   ])
    //   .exec();

    // const userFinancialData = require("../module_specs.json");
    const userFinancialData = require("../attack_mitigation.json");

    console.log(userFinancialData);

    // Handle chatbot user query
    const response = await chatbot.handleUserQuery(
      userFinancialData,
      userPrompt
    );

    console.log("Bot Response:", response["response"]);

    // Send response back to client
    res.json({ botResponse: response["response"] });
  } catch (error) {
    console.log("Error handling user query:", error);

    // Send error response to client
    res.json({ err: error.message });
  }
};

// ::::::::::::::::::::::;;;; Chat bot End;;;;;;;;::::::::::::
module.exports = {
  renderDashboard,
  getResponse,
  renderInvestment,
  renderFamily,
  addFamily,
  joinFamily,
  addFamilyGoal,
  deleteFamilyGoal,
  renderGoals,
  renderLearnings,
  renderLogin,
  renderRegister,
  register,
  login,
  addAccount,
  addInvestment,
  addGoal,
  addExpense,
  deleteGoal,
  logout,
  renderChat,
  renderExpenses,
  renderLiabilities,
  addLiabilities,
  vigiSafeDashboard,
  predictAttack,
};

// Liabilities
