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
server.use(express.json());

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: true })) /* This process form with multi-parts */

// Object to store user data
const users = {};


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
                profile_picture BLOB,
                time_created DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS host_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                detail_description TEXT,
                location TEXT NOT NULL,
                price_per_night REAL NOT NULL,
                max_guests INTEGER,
                amenities TEXT,
                available_from DATE,
                available_to DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                IMAGES BLOB NOT NULL,
                county TEXT NOT NULL,
                city Text NOT NULL,
                property_type TEXT NOT NULL,
                min_stay_days INTEGER,
                max_guest INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            `CREATE TABLE IF NOT EXISTS host_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                host_listing_id INTEGER,
                image_data BLOB,
                FOREIGN KEY (host_listing_id) REFERENCES host_listings(id)
            )`,
            `CREATE TABLE IF NOT EXISTS places_features (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feature TEXT,
                feature_type TEXT,
                feature_description TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS host_places_features (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                place_id INTEGER,
                feature TEXT,
                feature_type TEXT,
                feature_description TEXT,
                FOREIGN KEY (place_id) REFERENCES host_listings(id)
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


// === Post methods
// This route is for calculating the output cost for the total amount of days booked
server.post('/calculate-price', (req, res) => {
    const { startDate, endDate, propertyPricePerNight } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the number of days between the two dates
    const daysBetween = Math.floor((end - start) / (1000 * 3600 * 24));

    if (daysBetween < 0) {
        // Handle the case where the end date is before the start date
        return res.json({ totalPrice: 0 });
    }

    // Calculate the total price
    const totalPrice = daysBetween * propertyPricePerNight;
    totalPrice.toFixed(2);

    // Calculate the lodgeliberia Percentage
    const lodge_liberia_percent = 0.1 * totalPrice;

    // Total plus percentage
    const total_plus_percentage = totalPrice + lodge_liberia_percent;

    // Send back the total price as JSON
    res.json({ totalPrice, lodge_liberia_percent, total_plus_percentage });
});

// signup form post route
server.post('/signup', (req, res) => {
    const userFullname = req.body.useragreement;
    console.log(req.body);
    console.log(userFullname);

    // Insert the new user data into the 'users' table
    const sql = `
    INSERT INTO users (fullname, phone_number, email, username, password)
    VALUES (?, ?, ?, ?, ?)
`;

    // res.redirect('/lodgeliberia_home');
});

// Post Methods ********


// ==== Get methods
// 
server.get("/", (req, res) => {

    // Pulling Places Information from database
    lodge_liberia_db.all(`
        SELECT 
             users.fullname AS host_name,
             host_listings.title AS property_title,
             host_listings.id AS property_id,
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
            END AS available_month,
            strftime('%d', host_listings.available_from) AS available_day,
            strftime('%Y', host_listings.available_from) AS available_year
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
            host_place_id: row.property_id,
            property_title: row.property_title,
            property_description: row.property_description,
            property_price_per_night: row.property_price_per_night,
            available_month: row.available_month,
            available_day: row.available_day,
            available_year: row.available_year,
            // Convert BLOB to Base64 for each image
            base64Image: row.images ? Buffer.from(row.images).toString('base64') : null
        }));

        // Pass the listings array to your EJS template
        res.render('lodgeliberia_home', { host_listings });
    });

})

// Search Results Route
server.get("/search_result", (req, res) => {

    // Pulling requested search credentials from search form
    const place_location_address = req.query.place_location;
    const place_price = req.query.place_price;
    const property_type = req.query.search_dropdown !== 'Property' ? req.query.search_dropdown : null; // Avoid "Property" as a filter

    // Logs input for debugging
    // console.log(`${place_location_address} ${place_price} ${property_type}`);

    // == Build the SQL Query Dynamically ==========

    // Base SQL query to fetch listings
    let sqlQuery = `
        SELECT 
            users.fullname AS host_name,
            host_listings.id AS property_id,
            host_listings.title AS property_title,
            host_listings.description AS property_description,
            host_listings.price_per_night AS property_price_per_night,
            host_listings.Images AS images,
            host_listings.available_from,
            host_listings.available_to,
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
            END AS available_month,
            strftime('%d', host_listings.available_from) AS available_day,
            strftime('%Y', host_listings.available_from) AS available_year
        FROM users
        JOIN host_listings ON users.id = host_listings.user_id
        WHERE 1=1
    `;

    // Base SQL query to count total matching listings
    let countSql = `
        SELECT COUNT(*) AS total_places_found
        FROM users
        JOIN host_listings ON users.id = host_listings.user_id
        WHERE 1=1
    `;

    // Query parameters array to store dynamic conditions
    const queryParams = [];

    // Location filter (if provided)
    if (place_location_address) {
        sqlQuery += ` AND (
            host_listings.location LIKE ? 
            OR host_listings.county LIKE ? 
            OR host_listings.city LIKE ?
        )`;
        countSql += ` AND (
            host_listings.location LIKE ? 
            OR host_listings.county LIKE ? 
            OR host_listings.city LIKE ?
        )`;
        const locationSearchTerm = `%${place_location_address}%`;
        queryParams.push(locationSearchTerm, locationSearchTerm, locationSearchTerm);
    }

    // Price filter (if provided)
    if (place_price) {
        sqlQuery += ` AND host_listings.price_per_night <= ?`;
        countSql += ` AND host_listings.price_per_night <= ?`;
        queryParams.push(place_price);
    }

    // Property type filter (if provided)
    if (property_type) {
        sqlQuery += ` AND host_listings.property_type = ?`;
        countSql += ` AND host_listings.property_type = ?`;
        queryParams.push(property_type);
    }

    // Execute the SQL query for the listings
    lodge_liberia_db.all(sqlQuery, queryParams, (err, search_results1) => {
        if (err) {
            console.error('Error executing search query:', err);
            return res.status(500).send("Server Error");
        }

        // Execute the SQL query for the total count
        lodge_liberia_db.get(countSql, queryParams, (err, count_result) => {
            if (err) {
                console.error('Error executing count query:', err);
                return res.status(500).send("Server Error");
            }

            const total_places_found = count_result.total_places_found;

            // Process each result to convert images to Base64 format
            const search_results2 = search_results1.map(row => ({
                host_name: row.host_name,
                host_place_id: row.property_id,
                property_title: row.property_title,
                property_description: row.property_description,
                property_price_per_night: row.property_price_per_night,
                available_month: row.available_month,
                available_day: row.available_day,
                available_year: row.available_year,
                base64Image: row.images ? Buffer.from(row.images).toString('base64') : null
            }));

            // Render the results on the search result page
            res.render('search_result_page', {
                search_results2,
                total_places_found,
            });
        });
    });
});




// Place/s detail route page
server.get('/place_detail/:host_place_id', (req, res) => {
    const selected_place = req.params.host_place_id; // Get the property ID from the URL

    const sqlQuery = `
        SELECT 
            users.fullname AS host_name,
            users.profile_picture AS host_picture,
            host_listings.title AS property_title,
            host_listings.description AS property_description,
            host_listings.detail_description AS property_detail_description,
            host_listings.price_per_night AS property_price_per_night,
            host_listings.min_stay_days AS minimum_host_days,
            host_listings.max_guest AS max_guest_count,
            host_listings.location AS property_location,
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
            END AS available_month,
            strftime('%d', host_listings.available_from) AS available_day,
            strftime('%Y', host_listings.available_from) AS available_year,
            host_images.image_data AS image_blob  -- Retrieve image BLOB data from the host_images table
        FROM users
        JOIN host_listings ON users.id = host_listings.user_id
        LEFT JOIN host_images ON host_listings.id = host_images.host_listing_id  -- Join with the images table
        WHERE host_listings.id = ?
    `;

    // First query to get the property details
    lodge_liberia_db.all(sqlQuery, [selected_place], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length > 0) {
            // Group the results by listing, since there could be multiple rows for the same listing (due to multiple images)
            const propertyDetails = {
                host_name: rows[0].host_name,
                host_picture: rows[0].host_picture ? Buffer.from(rows[0].host_picture).toString('base64') : null,
                property_title: rows[0].property_title,
                property_description: rows[0].property_description,
                property_detail_description: rows[0].property_detail_description,
                property_price_per_night: rows[0].property_price_per_night,
                property_location: rows[0].property_location,
                minimum_host_days: rows[0].minimum_host_days,
                max_guest_count: rows[0].max_guest_count,
                available_month: rows[0].available_month,
                available_day: rows[0].available_day,
                available_year: rows[0].available_year,
                images: rows.map(row => row.image_blob ? Buffer.from(row.image_blob).toString('base64') : null) // Convert each BLOB to Base64
            };

            // Second query to get features and their count from the host_places_features table
            const featuresQuery = `SELECT feature FROM host_places_features WHERE place_id = ?`;

            lodge_liberia_db.all(featuresQuery, [selected_place], (err, featureRows) => {
                if (err) {
                    throw err;
                }

                // Add features and count to the propertyDetails object
                propertyDetails.features = featureRows.map(row => row.feature);
                propertyDetails.feature_count = featureRows.length; // Count the features

                // Debugging
                console.log('Features:', propertyDetails.features);
                console.log('Feature Count:', propertyDetails.feature_count);

                // Render the detail page with the property data, the list of images (in Base64 format), and features
                res.render('place_detail', { place: propertyDetails });
            });
        } else {
            res.status(404).send("Place not found");
        }
    });
});


server.get("/places_booked", (req, res) => {

    // Pulling Places Information from database
    lodge_liberia_db.all(`
        SELECT 
             users.fullname AS host_name,
             host_listings.title AS property_title,
             host_listings.id AS property_id,
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
            END AS available_month,
            strftime('%d', host_listings.available_from) AS available_day,
            strftime('%Y', host_listings.available_from) AS available_year
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
            host_place_id: row.property_id,
            property_title: row.property_title,
            property_description: row.property_description,
            property_price_per_night: row.property_price_per_night,
            available_month: row.available_month,
            available_day: row.available_day,
            available_year: row.available_year,
            // Convert BLOB to Base64 for each image
            base64Image: row.images ? Buffer.from(row.images).toString('base64') : null
        }));

        // Pass the listings array to your EJS template
        res.render('places_booked', { host_listings });
    });

    // Host your property route
    server.get('/host_property', (req, res) => {
        res.render('host_property')
    });

    // track your finance
    server.get('/finance', (req, res) => {
        res.render('finance')
    }) 

})


// Port Application is listening on {Port: 5600}
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
    console.log("LodgeLiberia"); // Don't change this
})
