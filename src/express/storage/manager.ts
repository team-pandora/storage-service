import { StatusCodes } from 'http-status-codes';
import * as internal from 'stream';
import { minioClient, minioConds } from '../../utils/minio/minioClient';
import handleMinioErrorsCode from '../../utils/minio/minioError';
import { ServerError } from '../error';

export const validateBucketKey = (bucket: string, key: string) => {
    if (!bucket || !key) {
        throw new ServerError(StatusCodes.BAD_REQUEST, 'Bucket and key must be provided before file');
    }
};

// todo: is there any need to check if the file param exists?
const handleUploadFile = async (bucket: string, key: string, file: string | internal.Readable | Buffer) => {
    validateBucketKey(bucket, key);

    await minioClient.makeBucket(bucket, '').catch((err) => {
        if (err.code !== 'BucketAlreadyOwnedByYou') {
            throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating bucket', err);
        }
    });

    await minioClient.putObject(bucket, key, file).catch((err) => {
        throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error uploading file, Minio', err);
    });
};

const handleDownloadFile = async (bucket: string, key: string) => {
    return minioClient.getObject(bucket, key).catch((err) => handleMinioErrorsCode(err, err.code));
};

// todo: with given key that does not exist in the bucket minioClient.removeObject() does not throw an error.
const handleDeleteFile = async (bucket: string, key) => {
    await minioClient.removeObject(bucket, key).catch((err) => {
        throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting file, Minio', err);
    });
};

const handleDeleteFiles = async (bucket: string, keys: string[]) => {
    await minioClient.removeObjects(bucket, keys).catch((err) => {
        throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting files, Minio', err);
    });
};

const handleCopyFile = async (sourceBucket: string, sourceKey: string, newKey: any) => {
    await minioClient
        .copyObject(sourceBucket, newKey, `${sourceBucket}/${sourceKey}`, minioConds)
        .catch((err) => handleMinioErrorsCode(err, err.code));
};

export { handleUploadFile, handleDownloadFile, handleDeleteFile, handleCopyFile, handleDeleteFiles };
