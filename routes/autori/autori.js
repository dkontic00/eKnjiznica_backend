const express = require("express");
const router = express.Router();
const autorController = require("../../controllers/autori/autorController");

router.route("/").get(autorController.dohvatiAutore);

router.route("/dodajAutora").post(autorController.dodajAutora);

router
  .route("/:id")
  .get(autorController.dohvatiAutora)
  .put(autorController.urediAutora)
  .delete(autorController.izbrisiAutora);

module.exports = router;
