const pgp = require('pg-promise')();

const db = pgp({
    user: 'sridhar',
    password: 'kLfa22StfwmYZGO1eVqPgQ',
    host: 'gloomy-hobbit-4482.7s5.aws-ap-south-1.cockroachlabs.cloud',
    port: 26257,
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: true // Set to true to enforce SSL validation
    }
});

const pgpHelpers = pgp.helpers

module.exports = { db, pgpHelpers }
