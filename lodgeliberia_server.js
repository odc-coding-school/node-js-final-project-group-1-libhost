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
const lodge_liberia = new sqlite3.Database(__dirname + '/database/lodgeliberia.db');

// Setup storage for storing files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Port Application is listening on {Port: 5600}
serrver.listen(port, () => {
    console.log(`Server running on port ${port}.`);
})
