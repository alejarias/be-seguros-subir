'use strict';

const express = require('express');
const checkAccountSession = require('../controllers/account/check-account-session');
const getStateServicesZero = require('../controllers/admin/get-stateServicesZero-controller');
const updateStateService = require('../controllers/admin/update-stateService-controller');

const router = express.Router();

router.get('/admin/serviceszero', checkAccountSession, getStateServicesZero);
router.put('/admin/services/:serviceId', checkAccountSession, updateStateService);

module.exports = router;
