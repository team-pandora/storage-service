import * as Busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServerError } from '../error';
import * as StorageManager from './manager';

const uploadFile = async (req: Request, res: Response) => {
    const keys: any = [];
    const { bucket, key } = req.params;

    // Await for the file to be sent to minio
    await new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        const fileUploads: Promise<any>[] = [];

        busboy.on('field', (_fieldName, _val) => {
            // add validation that no parameters has been sent
        });

        busboy.on('file', (_, file) => {
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
    const { bucket, key } = req.params;
    StorageManager.validateBucketKey(bucket, key);

    const stream = await StorageManager.handleDownloadFile(bucket, key);
    stream.pipe(res);
};

const deleteFile = async (req: Request, res: Response) => {
    const { key } = req.body;
    const { bucket } = req.params;
    StorageManager.validateBucketKey(bucket, key);

    if (typeof key === 'object') await StorageManager.handleDeleteFiles(bucket, key);
    else await StorageManager.handleDeleteFile(bucket, key);

    res.status(StatusCodes.OK).send({ bucket, key });
};

const copyFile = async (req: Request, res: Response) => {
    const { sourceBucket, sourceKey, newKey } = req.params;
    StorageManager.validateBucketKey(sourceBucket, sourceKey);

    await StorageManager.handleCopyFile(sourceBucket, sourceKey, newKey);
    res.status(StatusCodes.OK).send({ sourceBucket, newKey });
};

export default { uploadFile, downloadFile, deleteFile, copyFile };
