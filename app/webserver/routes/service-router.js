'use strict';

const express = require('express');
const checkAccountSession = require('../controllers/account/check-account-session');
const createService = require('../controllers/service/create-service-controller');
const getService = require('../controllers/service/get-service-controller');
const getServices = require('../controllers/service/get-services-controller');
const updateService = require('../controllers/service/update-service-controller');

const router = express.Router();

router.get('/services/:serviceId', checkAccountSession, getService);
router.get('/services', checkAccountSession, getServices);
router.post('/services', checkAccountSession, createService);
router.put('/services/:serviceId', checkAccountSession, updateService);

module.exports = router;
