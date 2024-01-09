const express = require("express");
const router = express.Router();
const transakcijeController = require("../../controllers/transakcije/transakcijeController");

router
  .route("/neaktivne")
  .get(transakcijeController.dohvcanjePovijestiTransakcija);
router
  .route("/aktivne")
  .get(transakcijeController.dohvacanjeAktivnihTransakcija);
router
  .route("/neaktivne/:id")
  .get(transakcijeController.dohvcanjePovijestiTransakcija);
router.route("/:id").put(transakcijeController.placenaTransakcija);

module.exports = router;
