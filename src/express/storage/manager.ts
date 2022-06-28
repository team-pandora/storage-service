import { StatusCodes } from 'http-status-codes';
import * as internal from 'stream';
import { minioClient, minioConds } from '../../utils/minio/client';
import handleMinioError from '../../utils/minio/error';
import { ServerError } from '../error';

const ensureBucket = async (bucketName: string) => {
    await minioClient.makeBucket(bucketName, '').catch((err) => {
        if (err.code !== 'BucketAlreadyOwnedByYou') {
            throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating bucket', err);
        }
    });
};

export const uploadFile = async (
    bucketName: string,
    objectName: string,
    stream: string | internal.Readable | Buffer,
) => {
    await ensureBucket(bucketName);
    await minioClient.putObject(bucketName, objectName, stream).catch(handleMinioError);

    const { size } = await minioClient.statObject(bucketName, objectName).catch(handleMinioError);
    return { bucketName, objectName, size };
};

export const downloadFile = async (bucketName: string, objectName: string) => {
    return minioClient.getObject(bucketName, objectName).catch(handleMinioError);
};

export const deleteFile = async (bucketName: string, objectName: string) => {
    await minioClient.removeObject(bucketName, objectName).catch(handleMinioError);
    return { bucketName, objectName };
};

export const deleteFiles = async (bucketName: string, objectNames: string[]) => {
    await minioClient.removeObjects(bucketName, objectNames).catch(handleMinioError);
    return { bucketName, objectNames };
};

export const copyFile = async (
    sourceBucketName: string,
    sourceObjectName: string,
    destBucketName: string,
    destObjectName: string,
) => {
    await ensureBucket(sourceBucketName);
    await ensureBucket(destBucketName);

    await minioClient
        .copyObject(destBucketName, destObjectName, `${sourceBucketName}/${sourceObjectName}`, minioConds)
        .catch(handleMinioError);

    return { bucketName: destBucketName, objectName: destObjectName };
};

export const fileExists = async (bucketName: string, objectName: string) => {
    const result = await minioClient
        .statObject(bucketName, objectName)
        .then(() => true)
        .catch((err) => {
            if (err.code === 'NoSuchBucket' || err.code === 'NoSuchObject' || err.code === 'NotFound') return false;
            return handleMinioError(err);
        });
    return result;
};

export const statFile = async (bucketName: string, objectName: string) => {
    return minioClient.statObject(bucketName, objectName).catch(handleMinioError);
};
