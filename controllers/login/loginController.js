const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const generateToken = require("../../middleware/generateToken");
const slanjeMaila = require("../../middleware/slanjeMaila");

const login = async (req, res) => {
  try {
    const { email } = req.body;
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Greska pri prijavi" });
    }

    const korisnik = await pool.query(
      `SELECT id, email, password, uloge.uloga AS uloga FROM korisnici
      JOIN uloge ON uloge.id_uloge = korisnici.uloga
      WHERE email = ($1)`,
      [email]
    );
    if (
      korisnik.rows[0] &&
      (await bcrypt.compare(password, korisnik.rows[0].password))
    ) {
      const id = korisnik.rows[0].id;
      const provjeraKorisnika = await pool.query(
        `SELECT aktivan_racun 
        FROM korisnici 
        WHERE id=($1)`,
        [id]
      );
      const aktivan_racun = provjeraKorisnika.rows[0].aktivan_racun;
      if (aktivan_racun) {
        const accessToken = generateToken(id);
        res.json({
          id: id,
          email: email,
          uloga: korisnik.rows[0].uloga,
          accessToken,
        });
      } else {
        res.status(400).json({ message: "Račun nije aktivan" });
      }
    } else {
      res.status(400).json({ message: "Pogrešan unos" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "Greška" });
  }
};

const register = async (req, res) => {
  const uloga = 3;
  const { ime } = req.body;
  const { email } = req.body;
  const { password } = req.body;
  console.log(req.body);
  const datum = new Date();
  if (!ime || !email || !password) {
    return res.status(400).json({ message: "Greška pri registraciji" });
  }
  try {
    const provjera = await pool.query(
      `SELECT * FROM korisnici WHERE email = ($1)`,
      [email]
    );
    if (provjera.rowCount !== 0) {
      return res.status(400).json({ message: "Pogrešan unos" });
    }

    const podaciKnjiznice = await pool.query(`SELECT * FROM knjiznica`);
    const { naziv, adresa, grad, postanski_broj, iban } =
      podaciKnjiznice.rows[0];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = await pool.query(
      `INSERT INTO korisnici (ime, email, password, uloga, datum_uclanjenja) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [ime, email, hashedPassword, uloga, datum]
    );

    const dohvacanjeClanarine = await pool.query(
      `SELECT id_tipa_transakcije, iznos FROM tip_transakcije WHERE tip_transakcije_opis=($1)`,
      ["Članarina"]
    );
    const iznos_clanarine = dohvacanjeClanarine.rows[0].iznos;
    const id_tipa_transakcije = dohvacanjeClanarine.rows[0].id_tipa_transakcije;

    data = {
      from: podaciKnjiznice.rows[0].email,
      to: email,
      subject: "Registracija",
      text: `Poštovani,\nuspješno ste se registrirali u eKnjižnicu. Nakon uplate članarine račun ce Vam biti aktivan.\n\nPodaci za uplatu su: \nPrimatelj: ${naziv}, ${adresa}, ${postanski_broj} ${grad}\nIBAN: ${iban}\nOpis plaćanja: Uplata članarine za <navesti-svoje-korisničko-ime>\nIznos: ${iznos_clanarine}€`,
    };
    slanjeMaila(data);

    await pool.query(
      `INSERT INTO transakcije (id_korisnika, id_tipa_transakcije, datum_izdavanja, iznos) VALUES ($1, $2, $3, $4)`,
      [id.rows[0].id, id_tipa_transakcije, datum, iznos_clanarine]
    );

    res.status(200).json({ email });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Greška" });
  }
};

module.exports = {
  login,
  register,
};
