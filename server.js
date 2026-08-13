require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(express.static(__dirname));


// ==========================================
// MYSQL CONNECTION POOL
// ==========================================

const db = mysql.createPool({

    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT),

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
// TEST DATABASE CONNECTION
// ==========================================

db.getConnection((err, connection) => {

    if (err) {

        console.log("Database connection failed:", err);

    } else {

        console.log("Connected to MySQL!");

        connection.release();

    }

});


// ==========================================
// GET ALL TASKS
// ==========================================

app.get("/tasks", (req, res) => {

    console.log("GET /tasks");

    const sql = "SELECT * FROM tasks ORDER BY id ASC";

    db.query(sql, (err, results) => {

        if (err) {

            console.log("GET ERROR:", err);

            return res.status(500).json({
                error: "Database error",
                details: err.message
            });
        }

        console.log("Tasks:", results);

        res.json(results);

    });

});


// ==========================================
// ADD TASK
// ==========================================

app.post("/tasks", (req, res) => {

    console.log("POST /tasks");

    const task = req.body.task;

    console.log("Task received:", task);

    if (!task || task.trim() === "") {

        return res.status(400).json({
            error: "Task is required"
        });

    }

    const sql =
        "INSERT INTO tasks (task, completed) VALUES (?, 0)";

    db.query(sql, [task], (err, result) => {

        if (err) {

            console.log("POST ERROR:", err);

            return res.status(500).json({
                error: "Database error",
                details: err.message
            });

        }

        console.log("Task inserted:", result.insertId);

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

    console.log("DELETE /tasks/:id", id);

    const sql =
        "DELETE FROM tasks WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("DELETE ERROR:", err);

            return res.status(500).json({
                error: "Database error",
                details: err.message
            });

        }

        console.log("Deleted:", result.affectedRows);

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

    console.log(
        "PUT /tasks/:id",
        id,
        completed
    );

    const sql =
        "UPDATE tasks SET completed = ? WHERE id = ?";

    db.query(
        sql,
        [completed, id],
        (err, result) => {

            if (err) {

                console.log("UPDATE ERROR:", err);

                return res.status(500).json({
                    error: "Database error",
                    details: err.message
                });

            }

            console.log("Updated:", result.affectedRows);

            res.json({
                message: "Task updated successfully"
            });

        }
    );

});


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/index.html"
    );

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