'use strict';

const Joi = require('@hapi/joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
    const schema = Joi.object({
        serviceId: Joi.string().guid({
            version: ['uuidv4'],
        }).required(),
        userId: Joi.string().guid({
            version: ['uuidv4'],
        }).required(),
    });

    Joi.assert(payload, schema);
}

async function getService(req, res, next) {
    const { serviceId } = req.params;
    const { userId } = req.claims;
    try {
        const payload = {
            serviceId,
            userId,
        };
        await validate(payload);
    } catch (e) {
        return res.status(400).send(e);
    }

    let connection;
    try {
        const sqlQuery = `SELECT content, 
        request_state, 
        created_at, 
        updated_at
        FROM services 
        WHERE id = ? AND user_id = ? AND finished_at IS NULL`;

        connection = await mysqlPool.getConnection();

        const [results] = await connection.execute(sqlQuery, [serviceId, userId]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).send();
        }

        const [serviceRawData] = results;

        const createdAt = serviceRawData.created_at.toISOString().replace('T', ' ').substring(0, 19);
        let updatedAt = serviceRawData.updated_at;
        if (updatedAt !== null) {
            updatedAt = serviceRawData.updated_at.toISOString().replace('T', ' ').substring(0, 19);;
        }

        const serviceData = {
            content: serviceRawData.content,
            requestState: serviceRawData.request_state,
            createdAt,
            updatedAt,
        }

        return res.send({
            Servicio: serviceData
        });
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getService;
