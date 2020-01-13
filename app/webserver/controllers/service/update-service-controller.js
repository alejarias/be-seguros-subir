'use strict';

const Joi = require('@hapi/joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validateSchema(payload) {
    const schema = Joi.object({
        content: Joi.string().min(10).max(1000).required(),
        serviceId: Joi.string().guid({
            version: ['uuidv4'],
        }).required(),
        userId: Joi.string().guid({
            version: ['uuidv4'],
        }).required(),
    });

    Joi.assert(payload, schema);
}

async function updateService(req, res, next) {
    const { serviceId } = req.params;
    const { userId } = req.claims;

    const serviceData = {
        ...req.body,
        serviceId,
        userId,
    };
    try {
        await validateSchema(serviceData);
    } catch (e) {
        console.error(e);
        return res.status(400).send(e);
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let connection;

    try {
        connection = await mysqlPool.getConnection();

        const sqlUpdateServiceData = `UPDATE services 
        SET content = ?,
        updated_at = ? 
        WHERE id = ? AND user_id = ? AND finished_at IS NULL`;

        const [updateCheck] = await connection.query(sqlUpdateServiceData, [
            serviceData.content,
            now,
            serviceId,
            userId
        ]);
        connection.release();

        if (updateCheck.changedRows !== 1) {
            return res.status(404).send();
        }

        res.status(204).send();

    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);

        return res.status(500).send();
    }

}

module.exports = updateService;
