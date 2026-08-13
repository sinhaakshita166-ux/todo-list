require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.log("Connection failed:", err);
        return;
    }

    console.log("Connected to Aiven MySQL!");

    db.query("SELECT * FROM tasks", (err, results) => {
        if (err) {
            console.log("SELECT ERROR:", err);
        } else {
            console.log("Tasks in database:");
            console.log(results);
        }

        db.end();
    });
});