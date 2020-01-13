'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function getServices(req, res, next) {
    const { userId } = req.claims;
    let connection;

    try {

        const sqlQuery = `SELECT * 
        FROM services 
        WHERE user_id = ?`;

        connection = await mysqlPool.getConnection();

        const [results] = await connection.execute(sqlQuery, [userId]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).send();
        }

        const services = results.map(service => {

            const createdAt = service.created_at.toISOString().replace('T', ' ').substring(0, 19);
            let updatedAt = service.updated_at;
            if (updatedAt !== null) {
                updatedAt = service.updated_at.toISOString().replace('T', ' ').substring(0, 19);
            }

            return {
                ...service,
                requestState: service.request_state,
                createdAt,
                updatedAt,
                user_id: undefined,
                request_state: undefined,
                created_at: undefined,
                updated_at: undefined,
                finished_at: undefined,
            }
        })
        return res.status(200).send(services);

    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getServices;
