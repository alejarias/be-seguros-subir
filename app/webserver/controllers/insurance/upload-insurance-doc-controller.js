'use strict';

const cloudinary = require('cloudinary').v2;
const mysqlPool = require('../../../database/mysql-pool');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadInsuranceDoc(req, res, next) {
    const { userId } = req.claims;
    const { file } = req;

    if (!file || !file.buffer) {
        return res.status(400).send({
            message: 'invalid document',
        });
    }

    cloudinary.uploader.upload_stream({
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
        format: 'pdf',
        crop: 'limit',
    }, async (err, result) => {
        if (err) {
            console.error(err);
            return res.status(400).send(err);
        }

        const {
            secure_url: secureUrl,
        } = result;

        let connection;
        try {
            const sqlQuery = `UPDATE policies SET eoi_url = ? WHERE user_id = ? AND eoi_url IS NULL AND finished_at IS NULL`;
            connection = await mysqlPool.getConnection();
            connection.execute(sqlQuery, [secureUrl, userId]);
            connection.release();

            res.header('Location', secureUrl);
            return res.status(201).send();
        } catch (e) {
            if (connection) {
                connection.release();
            }
            console.error(e)
            return res.status(500).send(e.message);
        }
    }).end(file.buffer);
}

module.exports = uploadInsuranceDoc;
