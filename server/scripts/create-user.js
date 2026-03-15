#!/usr/bin/env node
'use strict'

require('dotenv/config')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const postgres = require('postgres')

const [username, password] = process.argv.slice(2)

if (!username || !password) {
  console.error('Usage: node scripts/create-user.js <username> <password>')
  process.exit(1)
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL)
  const passwordHash = await bcrypt.hash(password, 10)
  const id = uuidv4()

  await sql`
    INSERT INTO players (id, username, password_hash)
    VALUES (${id}, ${username}, ${passwordHash})
  `

  console.log(`Created player: ${username} (${id})`)
  await sql.end()
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
