const express = require("express");
const router = express.Router();
const zanrController = require("../../controllers/zanrovi/zanrController");

router.route("/").get(zanrController.dohvatiZanrove);

router.route("/dodajZanr").post(zanrController.dodajZanr);

router
  .route("/:id")
  .get(zanrController.dohvatiZanr)
  .put(zanrController.urediZanr)
  .delete(zanrController.izbrisiZanr);

module.exports = router;
