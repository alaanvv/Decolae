const { Pool } = require('pg')
require('dotenv').config()

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '-c search_path=decolae'
})

module.exports = db
