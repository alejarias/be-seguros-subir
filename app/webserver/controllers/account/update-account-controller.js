'use strict';

const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const mysqlPool = require('../../../database/mysql-pool');
const sendgridMail = require('@sendgrid/mail');

async function sendUpdatedDataEmail(email) {
    const [username,] = email.split('@');
    const msg = {
        to: email,
        from: 'seguros-bienestar@yopmail.com',
        subject: 'Se han actualizado sus datos en Seguros Bienestar',
        text: `Estimad@ ${username}: se han actualizado sus datos en Seguros Bienestar`,
        html: `<strong>Estimad@ ${username}: se han actualizado sus datos en Seguros Bienestar</strong>`,
    };

    const data = await sendgridMail.send(msg);

    return data;
}

async function validateSchema(payload) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        gender: Joi.number().integer().min(0).max(1).required(),
        DOB: Joi.date().required(),
        address: Joi.string().required(),
        postalCode: Joi.string().required(),
        phone: Joi.string().required(),
        bornIn: Joi.string().required(),
    });

    Joi.assert(payload, schema);
}

async function updateAccountData(req, res, next) {
    const { userId } = req.claims;

    const accountData = {
        ...req.body,
    };
    try {
        await validateSchema(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send(e);
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const securePassword = await bcrypt.hash(accountData.password, 10);

    let connection;

    try {
        connection = await mysqlPool.getConnection();

        const sqlUpdateAccountData = `UPDATE users 
        SET first_name = ?,
        last_name = ?,
        email = ?,
        password = ?,
        gender = ?,
        dob = ?,
        address = ?,
        postal_code = ?,
        phone = ?,
        born_in = ?,
        updated_at = ? 
        WHERE id = ? AND deleted_at IS NULL`;

        const [updateCheck] = await connection.execute(sqlUpdateAccountData, [
            accountData.firstName,
            accountData.lastName,
            accountData.email,
            securePassword,
            accountData.gender,
            accountData.DOB,
            accountData.address,
            accountData.postalCode,
            accountData.phone,
            accountData.bornIn,
            now,
            userId
        ]);
        connection.release();

        if (updateCheck.changedRows !== 1) {
            return res.status(404).send();
        }

        res.status(204).send();

        try {
            await sendUpdatedDataEmail(accountData.email);

        } catch (e) {
            console.error(e);
        }

    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(409).send();
        }

        return res.status(500).send();
    }

}

module.exports = updateAccountData;
