import * as Minio from 'minio';
import config from '../../config';

const { minio } = config;

const minioClient = new Minio.Client({
    endPoint: minio.endpoint,
    port: minio.port,
    useSSL: minio.useSSL,
    accessKey: minio.accessKey,
    secretKey: minio.secretKey,
    partSize: minio.partSize,
});

const minioConds = new Minio.CopyConditions();

export { minioClient, minioConds };
