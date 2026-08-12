require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Serve HTML, CSS and JavaScript
app.use(express.static(__dirname));

// ==========================================
// CONNECT TO MYSQL USING CONNECTION POOL
// ==========================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// ==========================================
// GET ALL TASKS
// ==========================================

app.get("/tasks", (req, res) => {

    const sql = "SELECT * FROM tasks";

    db.query(sql, (err, results) => {

        if (err) {
            console.log("GET ERROR:", err);

            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json(results);
    });
});

// ==========================================
// ADD TASK
// ==========================================

app.post("/tasks", (req, res) => {

    const task = req.body.task;

    if (!task) {
        return res.status(400).json({
            error: "Task is required"
        });
    }

    const sql = "INSERT INTO tasks (task) VALUES (?)";

    db.query(sql, [task], (err, result) => {

        if (err) {
            console.log("POST ERROR:", err);

            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json({
            id: result.insertId,
            task: task,
            completed: 0
        });
    });
});

// ==========================================
// DELETE TASK
// ==========================================

app.delete("/tasks/:id", (req, res) => {

    const id = req.params.id;

    console.log("Deleting task:", id);

    const sql = "DELETE FROM tasks WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("DELETE ERROR:", err);

            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });
    });
});

// ==========================================
// UPDATE TASK
// ==========================================

app.put("/tasks/:id", (req, res) => {

    const id = req.params.id;
    const completed = req.body.completed;

    console.log("Updating task:", id);
    console.log("Completed:", completed);

    const sql = "UPDATE tasks SET completed = ? WHERE id = ?";

    db.query(sql, [completed, id], (err, result) => {

        if (err) {
            console.log("UPDATE ERROR:", err);

            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json({
            message: "Task updated successfully"
        });
    });
});

// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/index.html");

});

// ==========================================
// TEMPORARY DATABASE SETUP
// ==========================================

app.get("/setup-database", (req, res) => {

    const sql = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task VARCHAR(255) NOT NULL,
            completed TINYINT(1) DEFAULT 0
        )
    `;

    db.query(sql, (err) => {

        if (err) {

            console.log("SETUP ERROR:", err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            message: "Tasks table is ready!"
        });

    });

});

// ==========================================
// VERCEL
// ==========================================

module.exports = app;

// ==========================================
// LOCAL DEVELOPMENT
// ==========================================

if (require.main === module) {

    app.listen(3000, () => {

        console.log(
            "Server running on http://localhost:3000"
        );

    });

}