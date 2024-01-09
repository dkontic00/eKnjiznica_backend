const express = require("express");
const router = express.Router();
const nakladnikController = require("../../controllers/nakladnici/nakladnikController");

router.route("/").get(nakladnikController.dohvatiNakladnike);

router.route("/dodajNakladnika").post(nakladnikController.dodajNakladnika);

router
  .route("/:id")
  .get(nakladnikController.dohvatiNakladnika)
  .put(nakladnikController.urediNakladnika)
  .delete(nakladnikController.izbrisiNakladnika);

module.exports = router;
