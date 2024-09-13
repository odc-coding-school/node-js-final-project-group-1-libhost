// Intializing/Creating Server
const express = require('express');
const server = express();
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
                IMAGES BLOB NOT NULL,
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

// 
server.get("/", (req, res) => {

    // Pulling Places Information from database
    lodge_liberia_db.all(`
        SELECT 
             users.fullname AS host_name,
             host_listings.title AS property_title,
             host_listings.description AS property_description,
             host_listings.price_per_night AS property_price_per_night,
             host_listings.Images AS images,
             host_listings.available_from,
             CASE strftime('%m', host_listings.available_from)
                WHEN '01' THEN 'January'
                WHEN '02' THEN 'February'
                WHEN '03' THEN 'March'
                WHEN '04' THEN 'April'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'June'
                WHEN '07' THEN 'July'
                WHEN '08' THEN 'August'
                WHEN '09' THEN 'September'
                WHEN '10' THEN 'October'
                WHEN '11' THEN 'November'
                WHEN '12' THEN 'December'
            END AS available_month
        FROM users
        JOIN host_listings
        ON users.id = host_listings.user_id
        `, [], (err, rows) => {
        if (err) {
            throw err;
        }
        // Process each row to convert images to Base64
        const host_listings = rows.map(row => ({
            host_name: row.host_name,
            property_title: row.property_title,
            property_description: row.property_description,
            property_price_per_night: row.property_price_per_night,
            available_month: row.available_month,
            // Convert BLOB to Base64 for each image
            base64Image: row.images ? Buffer.from(row.images).toString('base64') : null
        }));

        // Pass the listings array to your EJS template
        res.render('lodgeliberia_home', { host_listings });
    });

})

// Port Application is listening on {Port: 5600}
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
    console.log("Love Tracy");
})
