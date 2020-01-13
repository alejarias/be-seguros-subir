'use strict';

const express = require('express');
const checkAccountSession = require('../controllers/account/check-account-session');
const createAccount = require('../controllers/account/create-account-controller');
const deleteAccount = require('../controllers/account/delete-account-controller');
const getAccountData = require('../controllers/account/get-account-controller');
const updateAccountData = require('../controllers/account/update-account-controller');

const router = express.Router();

router.delete('/accounts', checkAccountSession, deleteAccount);
router.get('/accounts', checkAccountSession, getAccountData);
router.post('/accounts', createAccount);
router.put('/accounts', checkAccountSession, updateAccountData);

module.exports = router;
