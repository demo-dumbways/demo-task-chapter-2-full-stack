const { Pool } = require('pg');

const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
