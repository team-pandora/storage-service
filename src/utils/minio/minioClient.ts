import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minio',
    secretKey: 'minio123',
    partSize: 10 * 1024 * 1024,
});

const minioConds = new Minio.CopyConditions();

export { minioClient, minioConds };
