const express = require("express");
const router = express.Router();
const knjigeController = require("../../controllers/knjige/knjigeController");

router.route("/").get(knjigeController.dohvatiKnjige);
router.route("/").post(knjigeController.dohvatiKnjige);

router.route("/detaljiKnjige/:id").get(knjigeController.dohvatiDetaljeKnjige);

router.route("/dodajKnjigu").post(knjigeController.dodajKnjigu);

router.route("/zaduziKnjigu").post(knjigeController.zaduziKnjigu);

router.route("/vratiKnjigu").patch(knjigeController.vratiKnjigu);

router
  .route("/dohvatiSvePosudeneKnjige")
  .get(knjigeController.dohvatiSvePosudeneKnjige);

router
  .route("/:id")
  .get(knjigeController.dohvatiKnjigu)
  .put(knjigeController.urediKnjigu)
  .delete(knjigeController.izbrisiKnjigu);

module.exports = router;
