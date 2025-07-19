// db.js
import pg from "pg";
import env from "dotenv";
env.config();

const db = new pg.Client({

  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});


// Export db properly
export { db }; // Export the db object
