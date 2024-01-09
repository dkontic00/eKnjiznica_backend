const pool = require("../../models/db");
const bcrypt = require("bcrypt");

const dohvatiKorisnike = async (req, res) => {
  try {
    const dohvacanjeKorisnika = await pool.query(
      `SELECT id, email, aktivan_racun, datum_uclanjenja, uloge.uloga as uloga 
      FROM korisnici join uloge on uloge.id_uloge = korisnici.uloga`
    );
    res.send(dohvacanjeKorisnika.rows);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvatiKorisnika = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }

    const dohvacanjeKorisnika = await pool.query(
      `SELECT id, ime, email, aktivan_racun, datum_uclanjenja, uloge.uloga as uloga FROM korisnici join uloge on uloge.id_uloge = korisnici.uloga WHERE id=($1)`,
      [id]
    );
    res.json(dohvacanjeKorisnika.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const promijeniUlogu = async (req, res) => {
  try {
    if (!req.body.indx || !req.body.id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }

    await pool.query(
      `UPDATE korisnici SET uloga = ($1) 
          WHERE id = ($2)`,
      [req.body.indx, req.body.id]
    );
    res.json("Uloga promijenjena");
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const izbrisiKorisnika = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška" });
    }

    const provjeriKorisnika = await pool.query(
      `SELECT id_korisnika FROM posudene_knjige WHERE id_korisnika=($1)`,
      [id]
    );
    if (provjeriKorisnika.rowCount !== 0) {
      res.status(400).json({ message: "Korisnika nije moguće izbrisati" });
    } else {
      await pool.query(
        `DELETE FROM korisnici
          WHERE id = ($1)`,
        [id]
      );
      res.json("Korisnik izbrisan");
    }
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvatiUloge = async (req, res) => {
  try {
    const uloge = await pool.query(`SELECT * from uloge`);
    res.json(uloge.rows);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const placenaClanarina = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška" });
    }

    let trenutni_datum = new Date().toJSON().slice(0, 10);
    await pool.query(
      `UPDATE korisnici SET aktivan_racun = true, datum_uclanjenja = ($1) WHERE id=($2)`,
      [trenutni_datum, id]
    );
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const promjeniLozinku = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ message: "Greška pri unosu" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(`UPDATE korisnici SET password=($1) WHERE id=($2)`, [
      hashedPassword,
      id,
    ]);
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const promjeniIme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }
    await pool.query(`UPDATE korisnici SET ime=($1) WHERE id=($2)`, [name, id]);
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvatiDetalje = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const dohvacanjeKorisnika = await pool.query(
      `SELECT id, ime, email, datum_uclanjenja FROM korisnici WHERE id=($1)`,
      [id]
    );

    const dohvatiKnjige = await pool.query(
      `SELECT *
      FROM posudene_knjige
      JOIN knjige ON knjige.id_knjiga = posudene_knjige.id_knjige
      INNER JOIN autori ON autori.id_autora = knjige.autor
      INNER JOIN zanrovi ON zanrovi.id_zanra = knjige.zanr
      WHERE id_korisnika=($1)
      ORDER BY datum_zaduzena_do DESC`,
      [id]
    );

    res.json({
      korisnik: dohvacanjeKorisnika.rows[0],
      knjige: dohvatiKnjige.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
    console.log(error.message);
  }
};

module.exports = {
  dohvatiKorisnike,
  dohvatiKorisnika,
  promijeniUlogu,
  izbrisiKorisnika,
  dohvatiUloge,
  placenaClanarina,
  promjeniIme,
  promjeniLozinku,
  dohvatiDetalje,
};
