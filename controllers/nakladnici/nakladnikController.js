const pool = require("../../models/db");

const dohvatiNakladnike = async (req, res) => {
  try {
    const sviNakladnici = await pool.query(`SELECT * FROM nakladnici`);
    res.json(sviNakladnici.rows);
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const dohvatiNakladnika = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const dohvaceniNakladnik = await pool.query(
      `SELECT * FROM nakladnici WHERE id_nakladnika=($1)`,
      [id]
    );
    res.json(dohvaceniNakladnik.rows[0]);
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const dodajNakladnika = async (req, res) => {
  try {
    const { nakladnik } = req.body;
    if (!nakladnik) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }

    const nakladnici = await pool.query(`SELECT nakladnik FROM nakladnici`);
    let provjera = false;

    nakladnici.rows.map((postojeciNakladnici) => {
      if (postojeciNakladnici.nakladnik === nakladnik) {
        provjera = true;
      }
    });
    if (provjera) {
      return res
        .status(400)
        .json({ message: "Pogreška pri unosu, nakladnik već postoji!" });
    }
    await pool.query(`INSERT INTO nakladnici (nakladnik) VALUES ($1)`, [
      nakladnik,
    ]);
    res.send();
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const urediNakladnika = async (req, res) => {
  try {
    const { id } = req.params;
    const { nakladnik } = req.body;
    if (!id || !nakladnik) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }
    await pool.query(
      `UPDATE nakladnici SET nakladnik=($1) WHERE id_nakladnika=($2)`,
      [nakladnik, id]
    );
    res.send();
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const izbrisiNakladnika = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška" });
    }
    const provjeriPosudeneKnjige = await pool.query(
      `SELECT id_knjige, knjige.nakladnik as nakladnik 
      FROM posudene_knjige 
      JOIN knjige ON knjige.id_knjiga=posudene_knjige.id_knjige
      WHERE nakladnik=($1)`,
      [id]
    );

    const provjeriKnjige = await pool.query(
      `SELECT * FROM knjige WHERE nakladnik=($1)`,
      [id]
    );

    if (
      provjeriPosudeneKnjige.rowCount !== 0 ||
      provjeriKnjige.rowCount !== 0
    ) {
      res.status(400).json({ message: "Nije moguće izbrisati" });
    } else {
      await pool.query(`DELETE FROM nakladnici WHERE id_nakladnika=($1)`, [id]);
      res.send();
    }
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

module.exports = {
  dohvatiNakladnike,
  dohvatiNakladnika,
  dodajNakladnika,
  urediNakladnika,
  izbrisiNakladnika,
};
