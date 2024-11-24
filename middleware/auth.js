const User = require('../models/User');
const jwt = require('jsonwebtoken');


const requireUserAuth = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.render('login', { errMsg: 'Access Denied' });
    }

    try {
        // Verify the token
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Find the user by ID from the token
        const user = await User.findById(decodedToken.id);

        if (!user) {
            return res.render('login', { errMsg: 'Access Denied' });
        }

        // Set the userId to request object and proceed to the next middleware
        req.userId = decodedToken.id;
        next();
    } catch (err) {
        // Handle errors such as invalid token or user not found
        return res.render('login', { errMsg: 'Access Denied' });
    }
};
module.exports = {
	requireUserAuth,
};
