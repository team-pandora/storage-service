/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import * as request from 'supertest';
import Server from '../src/express/server';
import logger from '../src/utils/logger';
import { minioClient } from '../src/utils/minio/client';

jest.setTimeout(30000);

const listMinioObjects = (bucketName: string) =>
    new Promise<string[]>((resolve, reject) => {
        const objects: string[] = [];
        const stream = minioClient.listObjects(bucketName, '', true);

        stream.on('data', (obj) => objects.push(obj.name));
        stream.on('error', reject);
        stream.on('end', () => {
            resolve(objects);
        });
    });

const deleteAllMinioObjects = async () => {
    try {
        const buckets = await minioClient.listBuckets();
        for (const bucket of buckets) {
            const objects = await listMinioObjects(bucket.name);
            if (objects.length) await minioClient.removeObjects(bucket.name, objects);
        }
    } catch (err) {
        logger.log('error', 'Failed to delete all minio objects.', err);
    }
};

describe('Storage Service', () => {
    let app: Express.Application;

    beforeEach(async () => {
        app = Server.createExpressApp();
    });

    const bucketName = 'dd6eb23d7d977568c854b326';
    const objectName = 'ab6eb23d7d977568c854b326';
    const newBucketName = 'f56eb23d7d977568c854b326';
    const newObjectName = 'a56eb23d7d977568c854b326';

    afterEach(async () => {
        await deleteAllMinioObjects();
    });

    describe('Upload', () => {
        it('should upload file', async () => {
            const result = await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            expect(result.body).toEqual({ bucketName, objectName, size: fs.statSync('./tests/test.txt').size });
        });

        it('should fail uploading file', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('Download', () => {
        it('should download file', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            const result = await request(app)
                .get(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .expect(StatusCodes.OK);

            expect(result.text).toEqual(fs.readFileSync('./tests/test.txt').toString());
        });

        it('fail downloading file, file does not exist', async () => {
            await request(app)
                .get(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .expect(StatusCodes.NOT_FOUND);
        });
    });

    describe('Delete', () => {
        it('should delete file', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            const result = await request(app)
                .delete(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .expect(StatusCodes.OK);

            expect(result.body).toEqual({ bucketName, objectName });
        });

        it('should delete two files', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${newObjectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            const result = await request(app)
                .delete(`/api/storage/bucket/${bucketName}`)
                .send({
                    objectNames: [objectName, newObjectName],
                })
                .expect(StatusCodes.OK);

            expect(result.body).toEqual({
                bucketName,
                objectNames: [objectName, newObjectName],
            });
        });

        it('should fail validation for unknown fields', async () => {
            await request(app)
                .delete(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .send({ invalidField: 'some value' })
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('Copy', () => {
        it('should copy file', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            const result = await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}/copy`)
                .send({ newBucketName, newObjectName })
                .expect(StatusCodes.OK);

            expect(result.body).toEqual({ bucketName: newBucketName, objectName: newObjectName });
        });

        it('should fail copying file', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}/copy`)
                .send({ newBucketName, newObjectName })
                .expect(StatusCodes.NOT_FOUND);
        });
    });

    describe('Exists', () => {
        it('should return true', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            const result = await request(app)
                .get(`/api/storage/bucket/${bucketName}/object/${objectName}/exists`)
                .expect(StatusCodes.OK);

            expect(result.body).toEqual(true);
        });

        it('should return false', async () => {
            const result = await request(app)
                .get(`/api/storage/bucket/${bucketName}/object/${objectName}/exists`)
                .expect(StatusCodes.OK);

            expect(result.body).toEqual(false);
        });
    });

    describe('Stat', () => {
        it('should return file stats', async () => {
            await request(app)
                .post(`/api/storage/bucket/${bucketName}/object/${objectName}`)
                .set('Content-Type', 'multipart/form-data')
                .field('file', fs.createReadStream('./tests/test.txt'))
                .expect(StatusCodes.OK);

            const result = await request(app)
                .get(`/api/storage/bucket/${bucketName}/object/${objectName}/stat`)
                .expect(StatusCodes.OK);

            expect(result.body).toMatchObject({ size: fs.statSync('./tests/test.txt').size });
        });

        it('should fail returning file stats', async () => {
            await request(app)
                .get(`/api/storage/bucket/${bucketName}/object/${objectName}/stat`)
                .expect(StatusCodes.NOT_FOUND);
        });
    });
});
