require('dotenv').config()

const PORT = process.env.PORT || 3001;
const MONGO_DB_URL = process.env.MONGO_DB_URL

module.exports = {
  MONGO_DB_URL,
  PORT
}