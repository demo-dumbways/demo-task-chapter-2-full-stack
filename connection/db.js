const { Pool } = require('pg');

let connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

connectionString = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : connectionString;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
