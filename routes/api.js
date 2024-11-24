const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const { requireUserAuth } = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/account", requireUserAuth, userController.addAccount);
router.get("/logout", requireUserAuth, userController.logout);
router.post("/botresponse", requireUserAuth, userController.getResponse);

module.exports = router;
