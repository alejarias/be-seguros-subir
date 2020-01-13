'use strict';

const Joi = require('@hapi/joi');
const uuidV4 = require('uuid/v4');
const mysqlPool = require('../../../database/mysql-pool');

const httpServerDomain = process.env.HTTP_SERVER_DOMAIN;

/*
requestState: 0 requested, 1 accepted, 2 rejected
*/

async function validate(payload) {
    const schema = Joi.object({
        content: Joi.string().min(10).max(1000).required(),
    });

    Joi.assert(payload, schema);
}

async function createService(req, res, next) {
    const serviceData = { ...req.body };
    const { userId } = req.claims;

    try {
        await validate(serviceData);
    } catch (e) {
        return res.status(400).send(e);
    }

    const now = new Date().toISOString().substring(0, 19).replace('T', ' ');
    const {
        content,
    } = serviceData;

    const serviceId = uuidV4();
    const service = {
        id: serviceId,
        request_state: 0,
        content,
        user_id: userId,
        created_at: now,
    };

    try {
        const connection = await mysqlPool.getConnection();
        try {
            const sqlCreateService = 'INSERT INTO services SET ?';
            await connection.query(sqlCreateService, service);

            connection.release();

            res.header('Location', `${httpServerDomain}/api/services/${serviceId}`);
            return res.status(201).send();
        } catch (e) {
            connection.release();
            throw e;
        }
    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = createService;
