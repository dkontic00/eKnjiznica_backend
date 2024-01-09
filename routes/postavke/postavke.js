const express = require("express");
const router = express.Router();
const postavkeController = require("../../controllers/postavke/postavkeController");

router.route("/").get(postavkeController.dohvatiPostavke);

router.route("/promijeni").post(postavkeController.promijeniPostavke);

router.route("/knjiznica").get(postavkeController.dohvatiInformacijeKnjiznice);

router
  .route("/knjiznicaPromjena")
  .put(postavkeController.promijeniPostavkeKnjiznice);

module.exports = router;
