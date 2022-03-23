import * as Busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as Utils from '../../utils/utils';
import { ServerError } from '../error';
import * as StorageManager from './manager';

// eslint-disable-next-line no-console
console.log(Utils.default.generateKey());

const uploadFile = async (req: Request, res: Response) => {
    let bucket: string = '';
    const keys: any = [];

    // Await for the file to be sent to minio
    await new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        const fileUploads: Promise<any>[] = [];
        const fields: any = {};

        busboy.on('field', (fieldName, val) => {
            fields[fieldName] = val;
        });

        busboy.on('file', (_, file) => {
            bucket = fields.bucket;
            const key = Utils.default.generateKey();
            fileUploads.push(StorageManager.handleUploadFile(bucket, key, file).catch(reject));
            keys.push(key);
        });

        busboy.on('error', (err) => {
            reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error uploading file, Busboy', err));
        });

        busboy.on('finish', () => {
            Promise.all(fileUploads).then(resolve).catch(reject);
        });
        req.pipe(busboy);
    });

    res.status(StatusCodes.OK).send({ bucket, keys });
};

const downloadFile = async (req: Request, res: Response) => {
    const { bucket, key } = req.body;
    StorageManager.validateBucketKey(bucket, key);

    const stream = await StorageManager.handleDownloadFile(bucket, key);
    stream.pipe(res);
};

const deleteFile = async (req: Request, res: Response) => {
    const { bucket, key } = req.body;
    StorageManager.validateBucketKey(bucket, key);

    if (typeof key === 'object') await StorageManager.handleDeleteFiles(bucket, key);
    else await StorageManager.handleDeleteFile(bucket, key);

    res.status(StatusCodes.OK).send({ message: 'File deleted', bucket, key });
};

const copyFile = async (req: Request, res: Response) => {
    const { sourceBucket, sourceKey } = req.body;
    StorageManager.validateBucketKey(sourceBucket, sourceKey);

    const newKey = Utils.default.generateKey();
    await StorageManager.handleCopyFile(sourceBucket, sourceKey, newKey);
    res.status(StatusCodes.OK).send({ sourceBucket, newKey });
};

export default { uploadFile, downloadFile, deleteFile, copyFile };
