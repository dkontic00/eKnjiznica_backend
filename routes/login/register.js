const express = require("express");
const router = express.Router();
const loginController = require("../../controllers/login/loginController");

router.route("/").post(loginController.register);

module.exports = router;
