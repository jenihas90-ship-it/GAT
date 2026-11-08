const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { login, register } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', auth, register);

module.exports = router;
