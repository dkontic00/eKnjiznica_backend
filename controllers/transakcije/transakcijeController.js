const pool = require("../../models/db");

const dohvacanjeAktivnihTransakcija = async (req, res) => {
  try {
    const dohvaceneTransakcije = await pool.query(
      `SELECT id_transakcije, id_korisnika,  transakcije.iznos, datum_izdavanja, korisnici.ime AS korisnik, tip_transakcije.tip_transakcije_opis AS tip_transakcije, knjige.naslov as naslov FROM transakcije 
      JOIN korisnici ON korisnici.id = transakcije.id_korisnika
      JOIN tip_transakcije ON tip_transakcije.id_tipa_transakcije = transakcije.id_tipa_transakcije
      LEFT OUTER JOIN knjige ON knjige.id_knjiga = transakcije.id_knjige
      WHERE placeno=($1)`,
      [false]
    );
    const transakcije = dohvaceneTransakcije.rows;

    res.json({ transakcije });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvcanjePovijestiTransakcija = async (req, res) => {
  try {
    if (!req.params.id) {
      const dohvaceneTransakcije = await pool.query(
        `SELECT id_transakcije, id_korisnika, datum_izdavanja, datum_placeno, korisnici.ime AS korisnik, tip_transakcije.tip_transakcije_opis AS tip_transakcije, transakcije.iznos, knjige.naslov as naslov FROM transakcije 
      JOIN korisnici ON korisnici.id = transakcije.id_korisnika
      JOIN tip_transakcije ON tip_transakcije.id_tipa_transakcije = transakcije.id_tipa_transakcije
      LEFT OUTER JOIN knjige ON knjige.id_knjiga = transakcije.id_knjige
      WHERE placeno=($1)`,
        [true]
      );
      const transakcije = dohvaceneTransakcije.rows;
      res.json({ transakcije });
    } else {
      const { id } = req.params;

      const dohvaceneTransakcije = await pool.query(
        `SELECT id_transakcije, tip_transakcije.tip_transakcije_opis AS tip_transakcije, transakcije.iznos, knjige.naslov as naslov FROM transakcije 
      JOIN korisnici ON korisnici.id = transakcije.id_korisnika
      JOIN tip_transakcije ON tip_transakcije.id_tipa_transakcije = transakcije.id_tipa_transakcije
      LEFT OUTER JOIN knjige ON knjige.id_knjiga = transakcije.id_knjige
      WHERE placeno=($1) AND id_korisnika=($2)`,
        [true, id]
      );
      const transakcije = dohvaceneTransakcije.rows;
      res.json({ transakcije });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const placenaTransakcija = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_korisnika, datum } = req.body;

    if (!id || !id_korisnika) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }

    await pool.query(
      `UPDATE transakcije SET placeno = ($1), datum_placeno = ($2) WHERE id_transakcije = ($3)`,
      [true, datum, id]
    );

    const transakcije = await pool.query(
      `SELECT * FROM transakcije WHERE id_korisnika=($1) AND placeno=($2)`,
      [id_korisnika, false]
    );
    if (transakcije.rowCount === 0) {
      await pool.query(
        `UPDATE korisnici SET aktivan_racun = ($1) WHERE id=($2)`,
        [true, id_korisnika]
      );
    }

    res.status(200).send();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

module.exports = {
  dohvacanjeAktivnihTransakcija,
  dohvcanjePovijestiTransakcija,
  placenaTransakcija,
};
