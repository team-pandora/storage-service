import * as Minio from 'minio';
import config from '../../config';

const { minio } = config;

const minioClient = new Minio.Client(minio);

const minioConds = new Minio.CopyConditions();

export { minioClient, minioConds };
