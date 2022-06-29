import * as Minio from 'minio';
import config from '../../config';

const { minio } = config;

export const minioClient = new Minio.Client(minio);

export const minioConds = new Minio.CopyConditions();
