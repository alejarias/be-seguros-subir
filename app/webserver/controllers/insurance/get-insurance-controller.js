'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function getInsurances(req, res, next) {
    const { userId } = req.claims;

    let connection;
    try {

        const sqlQuery = `SELECT * 
        FROM policies 
        WHERE user_id = ? AND finished_at IS NULL`;

        connection = await mysqlPool.getConnection();

        const [results] = await connection.execute(sqlQuery, [userId]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).send();
        }

        const insurances = results.map(insurance => {

            const createdAt = insurance.created_at.toISOString().replace('T', ' ').substring(0, 19);
            let updatedAt = insurance.updated_at;
            if (updatedAt !== null) {
                updatedAt = insurance.updated_at.toISOString().replace('T', ' ').substring(0, 19);
            }

            return {
                ...insurance,
                policyId: insurance.id,
                policyNumber: insurance.policy_number,
                policyType: insurance.policy_type,
                policyPrice: insurance.policy_price,
                policyPeriod: insurance.policy_period,
                policyDocument: insurance.eoi_url,
                createdAt,
                updatedAt,
                id: undefined,
                user_id: undefined,
                policy_number: undefined,
                policy_type: undefined,
                policy_price: undefined,
                policy_period: undefined,
                eoi_url: undefined,
                created_at: undefined,
                updated_at: undefined,
                finished_at: undefined,
            }
        })
        return res.status(200).send(insurances);

        // const [insuranceRawData] = results;

        // const createdAt = insuranceRawData.created_at.toISOString().replace('T', ' ').substring(0, 19);
        // const updatedAt = insuranceRawData.updated_at;
        // if (updatedAt !== null) {
        //     updatedAt = insurance.updated_at.toISOString().replace('T', ' ').substring(0, 19);;
        // }

        // const insuranceData = {
        //     policyNumber: insuranceRawData.policy_number,
        //     policyType: insuranceRawData.policy_type,
        //     policyPrice: insuranceRawData.policy_price,
        //     policyPeriod: insuranceRawData.policy_period,
        //     policyDocument: insuranceRawData.eoi_url,
        //     createdAt,
        //     updatedAt,
        // }

        // return res.send({
        //     Póliza: insuranceData
        // });
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getInsurances;
