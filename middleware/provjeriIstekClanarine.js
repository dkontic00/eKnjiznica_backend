const pool = require("../models/db");
const slanjeMaila = require("./slanjeMaila");

const provjeriIstekClanarine = async () => {
  try {
    const podaciKnjiznice = await pool.query(`SELECT * FROM knjiznica`);
    const { naziv, adresa, grad, postanski_broj, iban } =
      podaciKnjiznice.rows[0];
    const dohvaceniKorisnici = await pool.query(`SELECT * FROM korisnici`);
    const data = dohvaceniKorisnici.rows;
    const datum = new Date();

    const dohvacanjeClanarine = await pool.query(
      `SELECT id_tipa_transakcije, iznos FROM tip_transakcije WHERE tip_transakcije_opis=($1)`,
      ["Članarina"]
    );
    const iznos_clanarine = dohvacanjeClanarine.rows[0].iznos;
    const id_tipa_transakcije = dohvacanjeClanarine.rows[0].id_tipa_transakcije;

    data.map((user) => {
      if (user.aktivan_racun && user.uloga === 3) {
        let date_temp = new Date(
          datum.getFullYear(),
          datum.getMonth(),
          datum.getDate()
        );
        const date_temp_ms = date_temp.getTime();

        let datum_isteka = new Date(user.datum_uclanjenja);
        datum_isteka.setDate(datum_isteka.getDate() + 365);
        const datum_isteka_ms = datum_isteka.getTime();

        let datum_obavijesti = new Date(user.datum_uclanjenja);
        datum_obavijesti.setDate(datum_obavijesti.getDate() + 360);
        const datum_obavijesti_ms = datum_obavijesti.getTime();

        const provjera = datum_isteka_ms - date_temp_ms;
        const obavijest = datum_obavijesti_ms - date_temp_ms;

        if (obavijest === 0) {
          const mail_data = {
            from: podaciKnjiznice.rows[0].email,
            to: user.email,
            subject: "Članarina",
            text: `Poštovani,\nvaša članarina će isteći za 5 dana te će Vam račun biti deaktiviran.\n\nPodaci za uplatu su: \nPrimatelj: ${naziv}, ${adresa}, ${postanski_broj} ${grad}\nIBAN: ${iban}\nOpis plaćanja: Uplata članarine za <navesti-svoje-korisničko-ime>\nIznos: ${iznos_clanarine}€`,
          };
          slanjeMaila(mail_data);
        }
        if (provjera <= 0) {
          const mail_data = {
            from: podaciKnjiznice.rows[0].email,
            to: user.email,
            subject: "Članarina",
            text: `Poštovani,\nvaša članstvo je isteklo te Vam je račun deaktiviran. Plaćanjem članarine, račun će Vam se aktivirati. \nPodaci za uplatu su: \nPrimatelj: ${naziv}, ${adresa}, ${postanski_broj} ${grad}\nIBAN: ${iban}\nOpis plaćanja: Uplata članarine za <navesti-svoje-korisničko-ime>\nIznos: ${iznos_clanarine}€`,
          };

          slanjeMaila(mail_data);

          pool.query(
            `UPDATE korisnici SET aktivan_racun = false WHERE id=($1)`,
            [user.id]
          );

          pool.query(
            `INSERT INTO transakcije (id_korisnika, id_tipa_transakcije, iznos) VALUES ($1, $2, $3)`,
            [user.id, id_tipa_transakcije, iznos_clanarine]
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = provjeriIstekClanarine;
