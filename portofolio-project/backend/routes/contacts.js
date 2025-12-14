const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

// Rate limiting: 5 requests per 15 minutes
const contactLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 5,
    message: { 
        success: false, 
        message: 'Too many contact attempts. Please try again later.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
router.post('/send', contactLimiter, contactController.sendContactMessage);
router.get('/test', contactController.testEndpoint);

module.exports = router;