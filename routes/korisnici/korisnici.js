const express = require("express");
const router = express.Router();
const korisniciController = require("../../controllers/korisnici/korisniciController");

router.route("/").get(korisniciController.dohvatiKorisnike);

router.route("/detaljiKorisnika/:id").get(korisniciController.dohvatiDetalje);

router.route("/promijeniUlogu").put(korisniciController.promijeniUlogu);

router.route("/uloge").get(korisniciController.dohvatiUloge);

router.route("/:id").delete(korisniciController.izbrisiKorisnika);

router.route("/:id").get(korisniciController.dohvatiKorisnika);

router.route("/:id").patch(korisniciController.promjeniIme);
router.route("/:id").put(korisniciController.promjeniLozinku);

router.route("/aktivirajRacun").post(korisniciController.placenaClanarina);

module.exports = router;
