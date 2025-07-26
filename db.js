// db.js
import pkg from "pg";
import env from "dotenv";
env.config();
const {Pool}=pkg;

const db = new Pool({

  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DBPORT,
});


// Export db properly
export default db; // Export the db object
