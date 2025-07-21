const express = require('express');
const app = express();

// Middleware to handle errors  
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        success: false,
        message: err.message || 'Internal Server Error'
    });
}
);

// Export the app for use in server.js
module.exports = app;

