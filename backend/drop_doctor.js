const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting:", err);
    process.exit(1);
  }
  db.query("DROP TABLE IF EXISTS doctor", (err, results) => {
    if (err) {
      console.error("Error dropping table:", err);
    } else {
      console.log("Doctor table dropped successfully.");
    }
    db.end();
  });
});
