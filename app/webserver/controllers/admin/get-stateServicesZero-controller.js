'use strict';

/*
admin gets all the services with request state = 0 (requested)
*/

const mysqlPool = require('../../../database/mysql-pool');

async function getStateServicesZero(req, res, next) {
    const { userId, userStatus } = req.claims;

    if (userStatus !== 2) {
        return res.status(401).send({ message: 'Solamente usuario ADMIN está autorizado' });
    }

    let connection;
    try {
        const sqlQuery = `SELECT * 
        FROM services 
        WHERE request_state = "0" AND finished_at is NULL`;

        connection = await mysqlPool.getConnection();

        const [results] = await connection.execute(sqlQuery, [userStatus]);

        connection.release();

        if (results.length === 0) {
            return res.status(404).send();
        }

        const services = results.map(service => {

            const createdAt = service.created_at.toISOString().replace('T', ' ').substring(0, 19);
            let updatedAt = service.updated_at;
            if (updatedAt !== null) {
                updatedAt = service.updated_at.toISOString().replace('T', ' ').substring(0, 19);;
            }

            return {
                ...service,
                requestState: service.request_state,
                userId: service.user_id,
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

module.exports = getStateServicesZero;
