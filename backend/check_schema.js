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
  db.query("DESCRIBE doctor", (err, results) => {
    if (err) {
      console.error("Error describing room:", err);
    } else {
      console.log("Room Table Schema:");
      console.log(JSON.stringify(results, null, 2));
    }
    db.end();
  });
});
