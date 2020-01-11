'use strict';

const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const mysqlPool = require('../../../database/mysql-pool');
const sendgridMail = require('@sendgrid/mail');
const uuidV4 = require('uuid/v4');

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendWelcomeEmail(email) {
    const [username,] = email.split('@');
    const msg = {
        to: email,
        from: 'seguros-bienestar@yopmail.com',
        subject: 'Bienvenid@ a Seguros Bienestar',
        text: `Bienvenid@ ${username} a Seguros Bienestar`,
        html: `<strong>Bienvenid@ ${username} a Seguros Bienestar</strong>`,
    };

    const data = await sendgridMail.send(msg);
    console.log(data);

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
        userStatus: Joi.number().integer().min(0).max(2).required(),
    });

    Joi.assert(payload, schema);
}

async function createAccount(req, res, next) {
    const accountData = { ...req.body };
    try {
        await validateSchema(accountData);
    } catch (e) {
        return res.status(400).send(e);
    }

    const now = new Date();
    const createdAt = now.toISOString().replace('T', ' ').substring(0, 19);
    const userId = uuidV4();
    const securePassword = await bcrypt.hash(accountData.password, 10);

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        await connection.query('INSERT INTO users SET ?', {
            id: userId,
            first_name: accountData.firstName,
            last_name: accountData.lastName,
            email: accountData.email,
            password: securePassword,
            gender: accountData.gender,
            dob: accountData.DOB,
            address: accountData.address,
            postal_code: accountData.postalCode,
            phone: accountData.phone,
            born_in: accountData.bornIn,
            user_status: accountData.userStatus,
            created_at: createdAt,
        });
        connection.release();

        res.status(201).send();

        try {
            await sendWelcomeEmail(accountData.email);
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

module.exports = createAccount;
