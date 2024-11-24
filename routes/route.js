const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const { requireUserAuth } = require("../middleware/auth");

router.get("/", requireUserAuth, userController.vigiSafeDashboard);

router.get("/thalesgpt", requireUserAuth, userController.renderChat);
router.get("/predict", requireUserAuth, userController.predictAttack);

router.get(
  "/vigiSafeDashboard",
  requireUserAuth,
  userController.vigiSafeDashboard
);

router.get("/login", userController.renderLogin);
router.get("/register", userController.renderRegister);

module.exports = router;
