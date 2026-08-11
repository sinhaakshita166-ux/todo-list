require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Serve HTML, CSS and JavaScript
app.use(express.static(__dirname));


// ===============================
// CONNECT TO MYSQL
// ===============================

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


// ===============================
// GET ALL TASKS
// ===============================

app.get("/tasks", (req, res) => {

    const sql = "SELECT * FROM tasks";

    db.query(sql, (err, results) => {

        if (err) {
            console.log("GET ERROR:", err);

            res.status(500).json({
                error: "Database error"
            });

            return;
        }

        res.json(results);
    });
});


// ===============================
// ADD TASK
// ===============================

app.post("/tasks", (req, res) => {

    const task = req.body.task;

    if (!task) {
        res.status(400).json({
            error: "Task is required"
        });

        return;
    }

    const sql = "INSERT INTO tasks (task) VALUES (?)";

    db.query(sql, [task], (err, result) => {

        if (err) {
            console.log("POST ERROR:", err);

            res.status(500).json({
                error: "Database error"
            });

            return;
        }

        res.json({
            id: result.insertId,
            task: task,
            completed: 0
        });
    });
});


// ===============================
// DELETE TASK
// ===============================

app.delete("/tasks/:id", (req, res) => {

    const id = req.params.id;

    console.log("Deleting task:", id);

    const sql = "DELETE FROM tasks WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("DELETE ERROR:", err);

            res.status(500).json({
                error: "Database error"
            });

            return;
        }

        res.json({
            message: "Task deleted successfully"
        });
    });
});


// ===============================
// UPDATE TASK
// ===============================

app.put("/tasks/:id", (req, res) => {

    const id = req.params.id;
    const completed = req.body.completed;

    console.log("Updating task:", id);
    console.log("Completed:", completed);

    const sql = "UPDATE tasks SET completed = ? WHERE id = ?";

    db.query(sql, [completed, id], (err, result) => {

        if (err) {
            console.log("UPDATE ERROR:", err);

            res.status(500).json({
                error: "Database error"
            });

            return;
        }

        res.json({
            message: "Task updated successfully"
        });
    });
});


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


// ===============================
// VERCEL
// ===============================

// Export the Express application
module.exports = app;


// ===============================
// LOCAL DEVELOPMENT
// ===============================

if (require.main === module) {

    db.connect((err) => {

        if (err) {
            console.log("Database connection failed:", err);
            return;
        }

        console.log("Connected to MySQL!");

        app.listen(3000, () => {
            console.log("Server running on http://localhost:3000");
        });

    });

}