const express = require("express");
const cors = require("cors");
const app = express();
const knjigeController = require("./controllers/knjige/knjigeController");
const authUser = require("./middleware/auth");
const provjeriIstekClanarine = require("./middleware/provjeriIstekClanarine");
const postavkeController = require("./controllers/postavke/postavkeController");

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());

/// RUTE ///

//app.use(postavkeController.dohvatiPostavke);
//app.use(provjeriIstekClanarine);

// JAVNE RUTE //

// KNJIGE

app.get("/", knjigeController.dohvatiKnjige);
app.post("/", knjigeController.dohvatiKnjige);

// INFORMACIJE

app.get("/informacije", postavkeController.dohvatiInformacijeKnjiznice);

// LOGIN

app.use("/login", require("./routes/login/login"));
app.use("/register", require("./routes/login/register"));

// PRIVATNE RUTE //

app.use(authUser);

// KNJIGE

app.use("/knjige", require("./routes/knjige/knjige"));

// KORISNICI

app.use("/korisnici", require("./routes/korisnici/korisnici"));

// AUTORI

app.use("/autori", require("./routes/autori/autori"));

// NAKLADNICI

app.use("/nakladnici", require("./routes/nakladnici/nakladnici"));

// ŽANR

app.use("/zanrovi", require("./routes/zanrovi/zanrovi"));

// TRANSAKCIJE

app.use("/transakcije", require("./routes/transakcije/transakcije"));

// POVIJEST POSUDBE

app.use(
  "/povijestPosudbe",
  require("./routes/povijestPosudbe/povijestPosudbe")
);

// POSTAVKE

app.use("/postavke", require("./routes/postavke/postavke"));

/// POKRETANJE SERVERA ///

app.listen(3000, () => {
  console.log("Server je pokrenut");
  setInterval(() => {
    provjeriIstekClanarine();
  }, 1000 * 1 * 60 * 60 * 24);
});
