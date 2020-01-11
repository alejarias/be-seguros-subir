'use strict';

const express = require('express');
const login = require('../controllers/login/login-controller');

const router = express.Router();

router.post('/logins', login);

module.exports = router;
