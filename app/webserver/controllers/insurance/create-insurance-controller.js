'use strict';

const Joi = require('@hapi/joi');
const uuidV4 = require('uuid/v4');
const mysqlPool = require('../../../database/mysql-pool');

const httpServerDomain = process.env.HTTP_SERVER_DOMAIN;

async function validate(payload) {
    const schema = Joi.object({
        policyType: Joi.number().integer().min(1).max(3).required(),
        policyPrice: Joi.number().precision(2).required(),
    });

    Joi.assert(payload, schema);
}

async function createInsurance(req, res, next) {
    const insuranceData = { ...req.body };
    const { userId } = req.claims;

    try {
        await validate(insuranceData);
    } catch (e) {
        return res.status(400).send(e);
    }

    const now = new Date().toISOString().substring(0, 19).replace('T', ' ');
    const {
        policyType,
        policyPrice,
    } = insuranceData;

    const policyId = uuidV4();
    const [policyNumber,] = policyId.split('-');

    const policy = {
        id: policyId,
        policy_number: policyNumber,
        user_id: userId,
        policy_type: policyType,
        policy_price: policyPrice,
        policy_period: "1 year",
        created_at: now,
    };

    try {
        const connection = await mysqlPool.getConnection();
        try {
            const sqlCreateInsurance = 'INSERT INTO policies SET ?';
            await connection.query(sqlCreateInsurance, policy);

            connection.release();

            res.header('Location', `${httpServerDomain}/api/insurances/${policyId}`);
            return res.status(201).send();

        } catch (e) {
            if (connection) {
                connection.release();
                throw e;
            }
        }
    } catch (e) {
        console.error(e)
        return res.status(500).send();
    }

}

module.exports = createInsurance;


