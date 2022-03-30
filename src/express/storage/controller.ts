import * as Busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as stream from 'stream';
import { promisify } from 'util';
import { ServerError } from '../error';
import * as StorageManager from './manager';

const uploadFile = async (req: Request, res: Response) => {
    const { bucket, key } = req.params;

    const result = await new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        let fileUpload: Promise<{
            bucket: string;
            key: string;
        }>;

        busboy.on('file', (field, file) => {
            if (field === 'file' && !fileUpload) {
                fileUpload = StorageManager.uploadFile(bucket, key, file);
            } else {
                file.resume();
            }
        });

        busboy.on('error', (err: any) => {
            reject(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, `Error uploading file, ${err.message}`, err));
        });

        busboy.on('finish', () => {
            if (!fileUpload) reject(new ServerError(StatusCodes.BAD_REQUEST, 'No file provided'));
            else fileUpload.then(resolve).catch(reject);
        });

        req.pipe(busboy);
    });

    res.status(StatusCodes.OK).send(result);
};

const downloadFile = async (req: Request, res: Response) => {
    const { bucket, key } = req.params;
    const fileStream = await StorageManager.downloadFile(bucket, key);

    fileStream.pipe(res);

    await promisify(stream.finished)(fileStream);
};

const deleteFiles = async (req: Request, res: Response) => {
    const result = await StorageManager.deleteFiles(req.params.bucket, req.body.key);
    res.status(StatusCodes.OK).send(result);
};

const copyFile = async (req: Request, res: Response) => {
    const { sourceBucket, sourceKey, newBucket, newKey } = req.body;
    const result = await StorageManager.copyFile(sourceBucket, sourceKey, newBucket, newKey);
    res.status(StatusCodes.OK).send(result);
};

const fileExists = async (req: Request, res: Response) => {
    const { bucket, key } = req.params;
    const result = await StorageManager.fileExists(bucket, key);
    res.status(StatusCodes.OK).send(result);
};

const statFile = async (req: Request, res: Response) => {
    const { bucket, key } = req.params;
    const result = await StorageManager.statFile(bucket, key);
    res.status(StatusCodes.OK).send(result);
};

export { uploadFile, downloadFile, deleteFiles, copyFile, fileExists, statFile };
