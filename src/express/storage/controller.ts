import * as Busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as Minio from 'minio';
import { ServerError } from '../error';

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minio',
    secretKey: 'minio123',
    partSize: 10 * 1024 * 1024,
});

const upload = async (req: Request, res: Response) => {
    // Await for the file to be sent to minio
    await new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        const fields: any = {};

        busboy.on('field', (fieldName, val) => {
            fields[fieldName] = val;
        });

        busboy.on('file', async (_fieldname, file, _filename, _encoding, _mimetype) => {
            const { bucket, key } = fields;
            if (!bucket || !key) {
                reject(new ServerError(StatusCodes.BAD_REQUEST, 'Bucket and key must be provided before file'));
            }

            await minioClient.makeBucket(bucket, '').catch((err) => {
                if (err.code !== 'BucketAlreadyOwnedByYou') {
                    reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating bucket', err));
                }
            });

            await minioClient
                .putObject(bucket, key, file, file.size, { 'Content-Type': 'multipart/form-data' })
                .catch((err) => {
                    reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error uploading file, Minio', err));
                });
        });

        busboy.on('error', (err) => {
            reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error uploading file, Busboy', err));
        });

        busboy.on('finish', resolve);

        req.pipe(busboy);
    });

    res.status(StatusCodes.OK).send('OK');
};

// const upload = async (req: Request, res: Response) => {
//     const busboy = Busboy({ headers: req.headers });
//     const requiredFields = ['bucket', 'key'];
//     const fields: any = {};

//     // Create promises for each required field
//     const fieldPromises = requiredFields.map((field) => {
//         return new Promise<void>((resolve) => {
//             busboy.on('field', (key, value) => {
//                 if (key === field) {
//                     fields[field] = value;
//                     resolve();
//                 }
//             });
//         });
//     });

//     // Await for the file to be sent to minio
//     await new Promise((resolve, reject) => {
//         busboy.on('file', async (_fieldname, file, _filename, _encoding, _mimetype) => {
//             // Await all required fields to be set TODO: handle not provided fields
//             await Promise.all(fieldPromises);
//             const { bucket, key } = fields;

//             await minioClient.makeBucket(bucket, '').catch((err) => {
//                 if (err.code !== 'BucketAlreadyOwnedByYou') {
//                     reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating bucket', err));
//                 }
//             });

//             await minioClient
//                 .putObject(bucket, key, file, file.size, { 'Content-Type': 'multipart/form-data' })
//                 .catch((err) => {
//                     reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error uploading file, Minio', err));
//                 });
//         });

//         busboy.on('error', (err) => {
//             reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error uploading file, Busboy', err));
//         });

//         busboy.on('finish', resolve);

//         req.pipe(busboy);
//     });

//     res.status(StatusCodes.OK).send('OK');
// };

async function download(req: Request, res: Response) {
    const { bucket, key } = req.body;
    const result = await minioClient.getObject(bucket, key);
    result.pipe(res);
}

export default { upload, download };
