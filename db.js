// db.js
import pkg from "pg";
import env from "dotenv";
env.config();
const {Pool}=pkg;

const db = new Pool({
connectionString: process.env.DATABASE_URL
});


// Export db properly
export default db; // Export the db object
