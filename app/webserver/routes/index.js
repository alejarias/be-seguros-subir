'use strict';

const accountRouter = require('./account-router');
const adminRouter = require('./admin-router');
const insuranceRouter = require('./insurance-router');
const loginRouter = require('./login-router');
const serviceRouter = require('./service-router');

module.exports = {
    accountRouter,
    adminRouter,
    insuranceRouter,
    loginRouter,
    serviceRouter,
};
