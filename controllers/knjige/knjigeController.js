const pool = require("../../models/db");
const slanjeMaila = require("../../middleware/slanjeMaila");

const dohvatiKnjige = async (req, res) => {
  try {
    const sveKnjige = await pool.query(
      `SELECT id_knjiga, naslov,
    autori.autor as autor,
    nakladnici.nakladnik as nakladnik,
    zanrovi.zanr as zanr,
    kolicina
    FROM knjige join autori on autori.id_autora = knjige.autor
    join nakladnici on nakladnici.id_nakladnika = knjige.nakladnik
    join zanrovi on zanrovi.id_zanra = knjige.zanr
    ORDER BY naslov ASC`
    );

    if (!req.body.trazi) {
      res.json(sveKnjige.rows);
    } else {
      let data = [];
      let trazi = req.body.trazi;
      let kategorija = req.body.kategorija;

      if (!kategorija) {
        return res.status(400).json({ message: "Dogodila se pogreška!" });
      }

      trazi = trazi.toLowerCase();

      sveKnjige.rows.forEach((knjiga) => {
        if (knjiga[kategorija].toLowerCase().includes(trazi)) {
          data.push(knjiga);
        }
      });

      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Greška servera, pokušajte ponovno" });
  }
};

const dohvatiKnjigu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }

    const knjiga = await pool.query(
      `SELECT * FROM knjige
      JOIN autori ON autori.id_autora = knjige.autor
      JOIN nakladnici ON nakladnici.id_nakladnika = knjige.nakladnik
      JOIN zanrovi ON zanrovi.id_zanra = knjige.zanr
      WHERE id_knjiga = ($1)`,
      [id]
    );
    res.json(knjiga.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dodajKnjigu = async (req, res) => {
  try {
    const naslov = req.body.naslov;
    const autor = req.body.autor;
    const zanr = req.body.zanr;
    const nakladnik = req.body.nakladnik;
    const kolicina = req.body.kolicina;

    if (!naslov || !autor || !zanr || !nakladnik || !kolicina) {
      return res.status(400).json({ message: "Greška pri unosu" });
    }

    let provjera = false;
    const knjige = await pool.query(`SELECT naslov FROM knjige`);

    knjige.rows.map((postojeceKnjige) => {
      if (postojeceKnjige.naslov === naslov) {
        provjera = true;
      }
    });

    if (provjera) {
      return res
        .status(400)
        .json({ message: "Pogreška pri unosu, knjiga već postoji" });
    }

    await pool.query(
      `INSERT INTO knjige (naslov, autor, zanr, nakladnik, kolicina) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
      [naslov, autor, zanr, nakladnik, kolicina]
    );
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const urediKnjigu = async (req, res) => {
  try {
    const { id } = req.params;
    const { naslov } = req.body;
    const { autor } = req.body;
    const { zanr } = req.body;
    const { nakladnik } = req.body;
    const { kolicina } = req.body;

    if (!id || !naslov || !autor || !zanr || !nakladnik || !kolicina) {
      return res.status(400).json({ message: "Greška pri unosu" });
    }

    await pool.query(
      `UPDATE knjige SET naslov = ($1), 
      autor = ($2), 
      zanr = ($3), 
      nakladnik = ($4),  
      kolicina = ($5) 
      WHERE id_knjiga = ($6)`,
      [naslov, autor, zanr, nakladnik, kolicina, id]
    );
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const izbrisiKnjigu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }

    const provjeriKnjigu = await pool.query(
      `SELECT id_knjige 
      FROM posudene_knjige 
      WHERE id_knjige=($1)`,
      [id]
    );
    if (provjeriKnjigu.rowCount !== 0) {
      res.status(400).json({ message: "Nije moguće izbrisati" });
    } else {
      await pool.query(
        `DELETE FROM knjige 
        WHERE id_knjiga = ($1)`,
        [id]
      );
      res.send();
    }
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
  /*try {
    console.log("Brisanje knjige");
    const { id } = req.params;
    const dohvatiKnjigu = await pool.query(
      `SELECT kolicina FROM knjige WHERE id_knjiga = ($1)`,
      [id]
    );

    if (dohvatiKnjigu.rows[0].kolicina === 0) {
      res.status(400).send("Greska, knjiga nije vracena");
    } else {
      await pool.query(
        `DELETE FROM knjige 
        WHERE id_knjiga = ($1)`,
        [id]
      );
      res.send();
    }
  } catch (error) {
    console.log(error.message);
  }*/
};

const zaduziKnjigu = async (req, res) => {
  try {
    const { id_korisnika } = req.body;
    const { id_knjige } = req.body;

    if (!id_knjige || !id_korisnika) {
      return res.status(401).json({ message: "Dogodila se pogreška!" });
    }

    const rokPosudbe = await pool.query(
      `SELECT vrijednost FROM postavke WHERE opis='Rok posudbe'`
    );

    const datum = new Date();
    let datum_zaduzenja = new Date();
    let datum_zaduzena_do = new Date();
    datum_zaduzenja.setDate(datum.getDate());
    datum_zaduzena_do.setDate(datum.getDate() + rokPosudbe.rows[0].vrijednost);

    await pool.query(
      `UPDATE knjige SET kolicina = kolicina - 1 WHERE id_knjiga = ($1)`,
      [id_knjige]
    );
    await pool.query(
      `INSERT INTO posudene_knjige (id_korisnika, id_knjige, datum_zaduzenja, datum_zaduzena_do) VALUES ($1, $2, $3, $4)`,
      [id_korisnika, id_knjige, datum_zaduzenja, datum_zaduzena_do]
    );
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const vratiKnjigu = async (req, res) => {
  try {
    const { id_korisnika } = req.body;
    const { id_knjige } = req.body;

    if (!id_knjige || !id_korisnika) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }

    const naslov = await pool.query(
      `UPDATE knjige SET kolicina = kolicina + 1 WHERE id_knjiga = ($1) RETURNING naslov`,
      [id_knjige]
    );
    const datumi = await pool.query(
      `UPDATE posudene_knjige SET zaduzeno = ($1) WHERE id_korisnika = ($2) AND id_knjige = ($3) RETURNING datum_zaduzenja, datum_zaduzena_do`,
      [false, id_korisnika, id_knjige]
    );

    const dohvacanjeClanarine = await pool.query(
      `SELECT id_tipa_transakcije, iznos FROM tip_transakcije WHERE tip_transakcije_opis=($1)`,
      ["Zakasnina"]
    );
    const zakasnina = dohvacanjeClanarine.rows[0].iznos;
    const id_tipa_transakcije = dohvacanjeClanarine.rows[0].id_tipa_transakcije;

    let date = new Date();
    let trenutni_datum = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    let datum_vracanja = new Date(datumi.rows[0].datum_zaduzena_do);
    const trenutni_datum_ms = trenutni_datum.getTime();
    const datum_vracanja_ms = datum_vracanja.getTime();

    const razlika_dana =
      (datum_vracanja_ms - trenutni_datum_ms) / (1000 * 60 * 60 * 24);

    if (razlika_dana < 0) {
      let iznos_zakasnine = Math.abs(razlika_dana) * zakasnina;
      iznos_zakasnine = (Math.round(iznos_zakasnine * 100) / 100).toFixed(2);
      iznos_zakasnine = parseFloat(iznos_zakasnine);

      await pool.query(
        `INSERT INTO transakcije (id_korisnika, id_tipa_transakcije, iznos, datum_izdavanja, id_knjige) VALUES ($1, $2, $3, $4, $5)`,
        [
          id_korisnika,
          id_tipa_transakcije,
          iznos_zakasnine,
          trenutni_datum,
          id_knjige,
        ]
      );

      await pool.query(
        `UPDATE korisnici SET aktivan_racun = ($1) WHERE id = ($2)`,
        [false, id_korisnika]
      );

      const dohvaceniEmail = await pool.query(
        `SELECT email FROM korisnici WHERE id=($1)`,
        [id_korisnika]
      );
      const email = dohvaceniEmail.rows[0].email;

      const podaciKnjiznice = await pool.query(`SELECT * FROM knjiznica`);
      const { naziv, adresa, postanski_broj, grad, iban } =
        podaciKnjiznice.rows[0];

      const mail_data = {
        from: podaciKnjiznice.rows[0].email,
        to: email,
        subject: "Zakasnina",
        text: `Poštovani,\niznos zakasnine za ${naslov.rows[0].naslov} iznosi: ${iznos_zakasnine}€. Vaš profil je deaktiviran. Plaćanjem zakasnine, račun će Vam biti aktiviran.\n\nPodaci za uplatu su: \nPrimatelj: ${naziv}, ${adresa}, ${postanski_broj} ${grad}\nIBAN: ${iban}\nOpis plaćanja: Uplata zakasnine za <navesti-svoje-korisničko-ime>\nIznos: ${iznos_zakasnine}€`,
      };
      slanjeMaila(mail_data);
    }
    res.send();
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvatiSvePosudeneKnjige = async (req, res) => {
  try {
    const svePosudeneKnjige = await pool.query(
      `SELECT korisnici.email AS email, knjige.naslov AS naslov, id_korisnika, id_knjige, datum_zaduzenja, datum_zaduzena_do, zaduzeno
      FROM posudene_knjige
      JOIN knjige ON knjige.id_knjiga = id_knjige 
      JOIN korisnici ON korisnici.id = id_korisnika
      WHERE posudene_knjige.zaduzeno = ($1);`,
      [true]
    );
    res.json(svePosudeneKnjige.rows);
  } catch (error) {
    res.status(500).json({ message: "Dogodila se pogreška" });
  }
};

const dohvatiDetaljeKnjige = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Dogodila se pogreška!" });
    }
    const { id } = req.params;

    const knjiga = await pool.query(
      `SELECT *
      FROM knjige
      JOIN autori ON knjige.autor = autori.id_autora
      JOIN zanrovi ON zanrovi.id_zanra = knjige.zanr
      WHERE id_knjiga=($1)`,
      [id]
    );

    const korisnici = await pool.query(
      `SELECT id_korisnika, ime, aktivan_racun, datum_zaduzenja, datum_zaduzena_do, email, zaduzeno
      FROM posudene_knjige
      JOIN korisnici ON korisnici.id = posudene_knjige.id_korisnika
      WHERE id_knjige=($1)
      ORDER BY datum_zaduzena_do DESC`,
      [id]
    );

    res.json({ knjiga: knjiga.rows[0], korisnici: korisnici.rows });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Dogodila se pogreška!" });
  }
};

module.exports = {
  dohvatiKnjige,
  dohvatiKnjigu,
  dodajKnjigu,
  urediKnjigu,
  izbrisiKnjigu,
  zaduziKnjigu,
  vratiKnjigu,
  dohvatiSvePosudeneKnjige,
  dohvatiDetaljeKnjige,
};
