const pool = require("../../models/db");

const dohvacanjePovijestiPosudbe = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const dohvacenaPovijest = await pool.query(
      `SELECT id_posudbe, knjige.naslov AS naslov  FROM posudene_knjige
      JOIN knjige ON knjige.id_knjiga = posudene_knjige.id_knjige
       WHERE id_korisnika=($1) AND zaduzeno =($2)`,
      [id, false]
    );
    const povijest = dohvacenaPovijest.rows;
    res.json({ povijest });
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

module.exports = { dohvacanjePovijestiPosudbe };
