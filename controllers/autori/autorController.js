const pool = require("../../models/db");

const dohvatiAutore = async (req, res) => {
  try {
    const sviAutori = await pool.query(`SELECT * from autori`);
    res.json(sviAutori.rows);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const dohvatiAutora = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const autor = await pool.query(
      `SELECT * FROM autori WHERE id_autora=($1)`,
      [id]
    );
    res.json(autor.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const dodajAutora = async (req, res) => {
  try {
    const { autor } = req.body;
    if (!autor) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }
    let provjera = false;
    const autori = await pool.query(`SELECT autor FROM autori`);

    autori.rows.map((postojeciAutor) => {
      if (postojeciAutor.autor === autor) {
        provjera = true;
      }
    });
    if (provjera) {
      return res
        .status(400)
        .json({ message: "Pogreška pri unosu, autor već postoji!" });
    }
    await pool.query(
      `INSERT INTO autori (autor) 
        VALUES ($1)`,
      [autor]
    );
    res.send();
  } catch (error) {
    console.log(error.messages);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const urediAutora = async (req, res) => {
  try {
    const { id } = req.params;
    const { autor } = req.body;
    if (!id || !autor) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }
    await pool.query(`UPDATE autori SET autor=($1) WHERE id_autora=($2)`, [
      autor,
      id,
    ]);
    res.send();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

const izbrisiAutora = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const provjeriPosudeneKnjige = await pool.query(
      `SELECT id_knjige, knjige.autor as autor 
      FROM posudene_knjige 
      JOIN knjige ON knjige.id_knjiga=posudene_knjige.id_knjige
      WHERE autor=($1)`,
      [id]
    );
    const provjeriKnjigu = await pool.query(
      `SELECT * FROM knjige WHERE autor=($1)`,
      [id]
    );

    if (
      provjeriPosudeneKnjige.rowCount !== 0 ||
      provjeriKnjigu.rowCount !== 0
    ) {
      res.status(400).json({ message: "Nije moguće izbrisati" });
    } else {
      await pool.query(`DELETE FROM autori WHERE id_autora=($1)`, [id]);
      res.send();
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

module.exports = {
  dohvatiAutora,
  dohvatiAutore,
  dodajAutora,
  urediAutora,
  izbrisiAutora,
};
