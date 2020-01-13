'use strict';

/*
admin changes state service to: 1 (accepted) or 2 (rejected)
*/

const Joi = require('@hapi/joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validateSchema(payload) {
    const schema = Joi.object({
        requestState: Joi.number().integer().min(1).max(2).required(),
        serviceId: Joi.string().guid({
            version: ['uuidv4'],
        }).required(),
    });

    Joi.assert(payload, schema);
}

async function updateStateService(req, res, next) {
    const { serviceId } = req.params;
    const { userId, userStatus } = req.claims;

    const serviceData = {
        ...req.body,
        serviceId,
    };

    if (userStatus !== 2) {
        return res.status(401).send({ message: 'Solamente usuario ADMIN está autorizado' });
    }

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

        const sqlUpdateServiceState = `UPDATE services SET request_state = ?, updated_at = ? WHERE id = ? AND finished_at IS NULL`;

        const [updateCheck] = await connection.query(sqlUpdateServiceState, [
            serviceData.requestState,
            now,
            serviceId,
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

module.exports = updateStateService;
