'use strict';

const express = require('express');
const multer = require('multer');
const checkAccountSession = require('../controllers/account/check-account-session');
const createInsurance = require('../controllers/insurance/create-insurance-controller');
const deleteInsurance = require('../controllers/insurance/delete-insurance-controller');
const getInsurance = require('../controllers/insurance/get-insurance-controller');
const uploadInsurance = require('../controllers/insurance/upload-insurance-doc-controller');

const upload = multer();
const router = express.Router();

router.delete('/insurances/:policyId', checkAccountSession, deleteInsurance);
router.get('/insurances', checkAccountSession, getInsurance);
router.post('/insurances', checkAccountSession, createInsurance);
router.post('/insurances/document', checkAccountSession, upload.single('document'), uploadInsurance);

module.exports = router;
