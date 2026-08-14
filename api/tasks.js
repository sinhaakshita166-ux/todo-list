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
        connection = await mysql.createConnection(dbConfig);

        // TEMPORARY DATABASE SETUP
        // We will remove this after running it once.

        if (req.method === "GET" && req.query.setup === "true") {

            // Add recurring-task information to the existing tasks table.
            await connection.query(`
                ALTER TABLE tasks
                ADD COLUMN recurring TINYINT(1) NOT NULL DEFAULT 0,
                ADD COLUMN recurrence_type VARCHAR(20) DEFAULT NULL
            `);

            // Create the table that stores each day's task occurrence.
            await connection.query(`
                CREATE TABLE task_occurrences (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    task_id INT NOT NULL,
                    task_date DATE NOT NULL,
                    status ENUM('pending', 'completed', 'failed')
                        DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    completed_at DATETIME NULL,

                    FOREIGN KEY (task_id)
                        REFERENCES tasks(id)
                        ON DELETE CASCADE
                )
            `);

            return res.status(200).json({
                success: true,
                message: "Database upgraded successfully!"
            });
        }

        return res.status(403).json({
            error: "Setup endpoint only"
        });

    } catch (error) {

        console.error("Database Setup Error:", error);

        return res.status(500).json({
            error: "Database setup failed",
            details: error.message
        });

    } finally {

        if (connection) {
            await connection.end();
        }
    }
};