'use strict';

const express = require('express');

const {
    accountRouter,
    loginRouter,
} = require('./routes');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(express.json());
app.use('/api', accountRouter);
app.use('/api', loginRouter);


let server = null;
async function listen(port) {
    if (server) {
        return server;
    }

    try {
        server = await app.listen(port);
        return server;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

async function close() {
    if (server) {
        await server.close();
        server = null;
    } else {
        console.error('Can not close a non started server');
    }
}

module.exports = {
    listen,
    close,
};
