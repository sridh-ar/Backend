require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const pgp = require("pg-promise")();


const db = pgp({
  user: process.env.DATABASE_USR,
  password: process.env.DATABASE_PWD,
  host: process.env.DATABASE_URL,
  port: 26257,
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: true, // Set to true to enforce SSL validation
  },
});

const pgpHelpers = pgp.helpers;

module.exports = { db, pgpHelpers };
