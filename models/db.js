const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "123",
  host: "localhost",
  port: 5433,
  database: "eKnjiznica",
});

module.exports = pool;
