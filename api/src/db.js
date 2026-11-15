import { Pool } from 'pg'
import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env')
config({ path: envPath })

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL não definida. Configure ${envPath} usando api/.env.example como modelo.`)
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '-c search_path=decolae'
})

export default db
