// Intializing/Creating Server
const express = require('express');
const serrver = express();
const port = 5600;
// =======================
// Extended Modules Integration
const path = require("path");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const multer = require("multer");
// ============================================

// Static files render configurations
server.use('/public', express.static(__dirname + '/public/'));

// Set EJS as the templating engine
server.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: true })) /* This process form with multi-parts */

// Database Creation
const lodge_liberia_db = new sqlite3.Database(__dirname + '/database/lodgeliberia.db');

// Setup storage for storing files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database Creation Section
// Initialize/Create Database Tables if not exist
function initializeDatabase() {
    lodge_liberia_db.serialize(() => {
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                fullname TEXT NOT NULL,
                email TEXT UNIQUE,
                username TEXT NOT NULL,
                password TEXT Not Null,
                time_created DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS host_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                location TEXT NOT NULL,
                price_per_night REAL NOT NULL,
                max_guests INTEGER,
                amenities TEXT,
                available_from DATE,
                available_to DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`
        ];

        tables.forEach(query => {
            lodge_liberia_db.run(query, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    });
}

// Initialize database
initializeDatabase();

// Port Application is listening on {Port: 5600}
serrver.listen(port, () => {
    console.log(`Server running on port ${port}.`);
})
