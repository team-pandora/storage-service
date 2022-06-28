import * as Busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as stream from 'stream';
import { promisify } from 'util';
import { ServerError } from '../error';
import * as StorageManager from './manager';

export const uploadFile = async (req: Request, res: Response) => {
    const { bucketName, objectName } = req.params;

    const result = await new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        let fileUpload: Promise<{
            bucketName: string;
            objectName: string;
            size: number;
        }>;

        busboy.on('file', (field, file) => {
            if (field === 'file' && !fileUpload) {
                fileUpload = StorageManager.uploadFile(bucketName, objectName, file).catch(reject) as typeof fileUpload;
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

export const downloadFile = async (req: Request, res: Response) => {
    const { bucketName, objectName } = req.params;
    const fileStream = await StorageManager.downloadFile(bucketName, objectName);

    fileStream.pipe(res);

    await promisify(stream.finished)(fileStream);
};

export const deleteFile = async (req: Request, res: Response) => {
    const { bucketName, objectName } = req.params;
    const result = await StorageManager.deleteFile(bucketName, objectName);
    res.status(StatusCodes.OK).send(result);
};

export const deleteFiles = async (req: Request, res: Response) => {
    const result = await StorageManager.deleteFiles(req.params.bucketName, req.body.objectNames);
    res.status(StatusCodes.OK).send(result);
};

export const copyFile = async (req: Request, res: Response) => {
    const { bucketName, objectName } = req.params;
    const { newBucketName, newObjectName } = req.body;
    const result = await StorageManager.copyFile(bucketName, objectName, newBucketName, newObjectName);
    res.status(StatusCodes.OK).send(result);
};

export const fileExists = async (req: Request, res: Response) => {
    const { bucketName, objectName } = req.params;
    const result = await StorageManager.fileExists(bucketName, objectName);
    res.status(StatusCodes.OK).send(result);
};

export const statFile = async (req: Request, res: Response) => {
    const { bucketName, objectName } = req.params;
    const result = await StorageManager.statFile(bucketName, objectName);
    res.status(StatusCodes.OK).send(result);
};
