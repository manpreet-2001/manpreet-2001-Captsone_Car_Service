const express = require('express');
const { sendContactMessage, getContactInfo } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/info', getContactInfo);
router.post('/', validateContact, sendContactMessage);

module.exports = router;
