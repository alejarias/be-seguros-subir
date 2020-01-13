'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function getAccountData(req, res, next) {
    const { userId } = req.claims;

    let connection;
    try {

        const sqlQuery = `SELECT first_name, 
        last_name, 
        email, 
        gender, 
        dob, 
        address, 
        postal_code, 
        phone, 
        born_in 
        FROM users 
        WHERE id = ? AND deleted_at IS NULL`;

        connection = await mysqlPool.getConnection();

        const [results] = await connection.execute(sqlQuery, [userId]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).send();
        }
        const [accountData] = results;
        return res.send({
            Datos: accountData
        });
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getAccountData;
