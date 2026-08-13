const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    }
};

module.exports = async function handler(req, res) {

    let connection;

    try {

        // Connect to Aiven MySQL
        connection = await mysql.createConnection(dbConfig);

        const id = req.query.id;

        // ==========================================
        // GET ALL TASKS
        // ==========================================

        if (req.method === "GET") {

            const [rows] = await connection.query(
                "SELECT * FROM tasks ORDER BY id ASC"
            );

            return res.status(200).json(rows);
        }

        // ==========================================
        // ADD TASK
        // ==========================================

        if (req.method === "POST") {

            const { task } = req.body;

            if (!task || task.trim() === "") {

                return res.status(400).json({
                    error: "Task text required"
                });
            }

            const [result] = await connection.query(
                "INSERT INTO tasks (task, completed) VALUES (?, 0)",
                [task]
            );

            return res.status(201).json({
                id: result.insertId,
                task: task,
                completed: 0
            });
        }

        // ==========================================
        // UPDATE TASK
        // ==========================================

        if (req.method === "PUT") {

            const { completed } = req.body;

            await connection.query(
                "UPDATE tasks SET completed = ? WHERE id = ?",
                [completed, id]
            );

            return res.status(200).json({
                message: "Task updated successfully"
            });
        }

        // ==========================================
        // DELETE TASK
        // ==========================================

        if (req.method === "DELETE") {

            await connection.query(
                "DELETE FROM tasks WHERE id = ?",
                [id]
            );

            return res.status(200).json({
                message: "Task deleted successfully"
            });
        }

        // ==========================================
        // UNSUPPORTED METHOD
        // ==========================================

        return res.status(405).json({
            error: "Method not allowed"
        });

    } catch (error) {

        console.error("Database Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });

    } finally {

        if (connection) {
            await connection.end();
        }

    }
};