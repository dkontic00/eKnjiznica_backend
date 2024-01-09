const express = require("express");
const router = express.Router();
const povijestPosudbeController = require("../../controllers/povijestPosudbe/povijestPosudbeController");

router.route("/:id").get(povijestPosudbeController.dohvacanjePovijestiPosudbe);

module.exports = router;
