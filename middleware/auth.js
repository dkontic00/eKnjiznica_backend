const pool = require("../models/db");
const jwt = require("jsonwebtoken");

const authUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: "Greska, nema tokena" });
    }

    const token = authorization.split(" ")[1];

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query(
      `SELECT id, email FROM korisnici WHERE id=($1);`,
      [id]
    );
    req.user = user.rows[0];
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "No auth" });
  }
};

/*const protected = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Greska, nema token" });
  }

  const token = authorization.split(" ")[1];
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ error: "No auth" });
  }
};*/

/*async function authUser(req, res, next) {
  const prijavaIme = req.body.KorisnickoIme;
  const dohvcanjePostojecihKorisnika = await pool.query(
    `SELECT * FROM korisnici`
  );
  const postojeciKorisnici = dohvcanjePostojecihKorisnika.rows;
  let postoji = null;
  const korisnik = postojeciKorisnici.map((korisnik) => {
    if (korisnik.korisnicko_ime === prijavaIme) {
      postoji = prijavaIme;
    }
  });
  let pass = await pool.query(
    `SELECT password FROM korisnici WHERE korisnicko_ime = ($1)`,
    [prijavaIme]
  );
  pass = pass.rows;
  const passwd = pass.map((sifra) => {
    return sifra.password;
  });
  if (postoji == null) {
    res.status(400);
    return res.send("Potrebno je prijaviti se");
  }
  if (!(await bcrypt.compare(req.body.Password, passwd[0]))) {
    res.status(400);
    return res.send("Potrebno je prijaviti se");
  }

  next();
}*/

module.exports = authUser;
