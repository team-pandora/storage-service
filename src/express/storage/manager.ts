import { StatusCodes } from 'http-status-codes';
import * as internal from 'stream';
import { minioClient, minioConds } from '../../utils/minio/client';
import handleMinioError from '../../utils/minio/error';
import { ServerError } from '../error';

const ensureBucket = async (bucket: string) => {
    await minioClient.makeBucket(bucket, '').catch((err) => {
        if (err.code !== 'BucketAlreadyOwnedByYou') {
            throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating bucket', err);
        }
    });
};

export const uploadFile = async (bucket: string, key: string, file: string | internal.Readable | Buffer) => {
    await ensureBucket(bucket);
    await minioClient.putObject(bucket, key, file).catch(handleMinioError);
    return { bucket, key };
};

export const downloadFile = async (bucket: string, key: string) => {
    return minioClient.getObject(bucket, key).catch(handleMinioError);
};

export const deleteFiles = async (bucket: string, keys: string[]) => {
    await minioClient.removeObjects(bucket, keys).catch(handleMinioError);
    return { bucket, keys };
};

export const copyFile = async (sourceBucket: string, sourceKey: string, newBucket: string, newKey: string) => {
    await ensureBucket(newBucket);
    await minioClient.copyObject(newBucket, newKey, `${sourceBucket}/${sourceKey}`, minioConds).catch(handleMinioError);
    return { bucket: newBucket, key: newKey };
};

export const fileExists = async (bucket: string, key: string) => {
    const result = await minioClient
        .statObject(bucket, key)
        .then(() => true)
        .catch((err) => {
            if (err.code === 'NoSuchBucket' || err.code === 'NoSuchKey' || err.code === 'NotFound') return false;
            return handleMinioError(err);
        });
    return result;
};

export const statFile = async (bucket: string, key: string) => {
    return minioClient.statObject(bucket, key).catch(handleMinioError);
};
