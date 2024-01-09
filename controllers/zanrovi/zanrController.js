const pool = require("../../models/db");

const dohvatiZanrove = async (req, res) => {
  try {
    const sviZanrovi = await pool.query(`SELECT * FROM zanrovi`);
    res.json(sviZanrovi.rows);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvatiZanr = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const dohvaceniZanr = await pool.query(
      `SELECT * FROM zanrovi WHERE id_zanra=($1)`,
      [id]
    );
    res.json(dohvaceniZanr.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dodajZanr = async (req, res) => {
  try {
    const { zanr } = req.body;
    if (!zanr) {
      return res.status(400).json({ message: "Greška pri unosu!" });
    }

    const zanrovi = await pool.query(`SELECT zanr FROM zanrovi`);
    let provjera = false;

    zanrovi.rows.map((postojeciZanrovi) => {
      if (postojeciZanrovi.zanr === zanr) {
        provjera = true;
      }
    });

    if (provjera) {
      return res
        .status(400)
        .json({ message: "Pogreška pri unosu, žanr već postoji!" });
    }
    await pool.query(`INSERT INTO zanrovi (zanr) VALUES ($1)`, [zanr]);
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const urediZanr = async (req, res) => {
  try {
    const { id } = req.params;
    const { zanr } = req.body;
    if (!id || !zanr) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }
    await pool.query(`UPDATE zanrovi SET zanr=($1) WHERE id_zanra=($2)`, [
      zanr,
      id,
    ]);
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const izbrisiZanr = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const provjeriPosudeneKnjige = await pool.query(
      `SELECT id_knjige, knjige.zanr as zanr 
      FROM posudene_knjige 
      JOIN knjige ON knjige.id_knjiga=posudene_knjige.id_knjige
      WHERE zanr=($1)`,
      [id]
    );

    const provjeriKnjige = await pool.query(
      `SELECT * FROM knjige WHERE zanr=($1)`,
      [id]
    );

    if (
      provjeriPosudeneKnjige.rowCount !== 0 ||
      provjeriKnjige.rowCount !== 0
    ) {
      res.status(400).json({ message: "Nije moguće izbrisati" });
    } else {
      await pool.query(`DELETE FROM zanrovi WHERE id_zanra=($1)`, [id]);
      res.send();
    }
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

module.exports = {
  dohvatiZanr,
  dohvatiZanrove,
  dodajZanr,
  urediZanr,
  izbrisiZanr,
};
