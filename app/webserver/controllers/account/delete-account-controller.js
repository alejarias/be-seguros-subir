'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function deleteAccount(req, res, next) {
    const { userId } = req.claims;

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = `UPDATE users SET user_status = 0, deleted_at = ? WHERE id = ? AND deleted_at IS NULL`;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const [deletedStatus] = await connection.execute(sqlQuery, [now, userId]);
        connection.release();

        if (deletedStatus.changedRows !== 1) {
            return res.status(404).send();
        }

        return res.status(204).send();
    }
    catch (e) {
        if (connection) {
            connection.release();
        }
        return res.status(500).send(e.message);
    }
}

module.exports = deleteAccount;
