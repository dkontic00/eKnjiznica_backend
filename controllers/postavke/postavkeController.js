const pool = require("../../models/db");

const dohvatiInformacijeKnjiznice = async (req, res) => {
  try {
    const dohvacanjeInformacijaKnjiznice = await pool.query(
      `SELECT * FROM knjiznica`
    );
    const knjiznica = dohvacanjeInformacijaKnjiznice;
    res.json(knjiznica.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const promijeniPostavkeKnjiznice = async (req, res) => {
  try {
    if (
      !req.body.id ||
      !req.body.naziv ||
      !req.body.adresa ||
      !req.body.grad ||
      !req.body.postanski_broj ||
      !req.body.email ||
      !req.body.kontakt_broj ||
      !req.body.iban
    ) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const { id } = req.body;
    const { naziv } = req.body;
    const { adresa } = req.body;
    const { grad } = req.body;
    const { postanski_broj } = req.body;
    const { email } = req.body;
    const { kontakt_broj } = req.body;
    const { iban } = req.body;

    await pool.query(
      `UPDATE knjiznica SET naziv=($1),
      adresa=($2),
      grad=($3),
      postanski_broj=($4),
      email=($5),
      kontakt_broj=($6),
      iban=($7)
     WHERE id=($8)`,
      [naziv, adresa, grad, postanski_broj, email, kontakt_broj, iban, id]
    );
    res.send();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const dohvatiPostavke = async (req, res) => {
  try {
    const dohvacanjePostavki = await pool.query(`SELECT * FROM postavke`);
    const dohvacanjeVrijednostiTransakcija = await pool.query(
      `SELECT * FROM tip_transakcije`
    );

    const postavke = dohvacanjePostavki.rows;
    const transakcije = dohvacanjeVrijednostiTransakcija.rows;

    res.json({ postavke, transakcije });
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const promijeniPostavke = async (req, res) => {
  try {
    const dohvacanje_id_zakasnine = await pool.query(
      `SELECT id_tipa_transakcije FROM tip_transakcije WHERE tip_transakcije_opis=($1)`,
      ["Zakasnina"]
    );
    const dohvacanje_id_clanarine = await pool.query(
      `SELECT id_tipa_transakcije FROM tip_transakcije WHERE tip_transakcije_opis=($1)`,
      ["Članarina"]
    );

    const id_clanarine = dohvacanje_id_clanarine.rows[0].id_tipa_transakcije;
    const id_zakasnine = dohvacanje_id_zakasnine.rows[0].id_tipa_transakcije;

    if (
      !req.body.iznosClanarine ||
      !req.body.iznosZakasnine ||
      !req.body.rokPosudbe
    ) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }

    await pool.query(
      `UPDATE tip_transakcije SET iznos=($1) WHERE id_tipa_transakcije=($2)`,
      [req.body.iznosClanarine, id_clanarine]
    );

    await pool.query(
      `UPDATE tip_transakcije SET iznos=($1) WHERE id_tipa_transakcije=($2)`,
      [req.body.iznosZakasnine, id_zakasnine]
    );

    const dohvacanje_id_roka_posudbe = await pool.query(
      `SELECT id FROM postavke WHERE opis=($1)`,
      ["Rok posudbe"]
    );
    const id_roka_posudbe = dohvacanje_id_roka_posudbe.rows[0].id;

    await pool.query(`UPDATE postavke SET vrijednost=($1) WHERE id=($2)`, [
      req.body.rokPosudbe,
      id_roka_posudbe,
    ]);

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

module.exports = {
  dohvatiPostavke,
  promijeniPostavke,
  dohvatiInformacijeKnjiznice,
  promijeniPostavkeKnjiznice,
};
