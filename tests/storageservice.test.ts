import * as fs from 'fs';
import * as request from 'supertest';
import Server from '../src/express/server';
import * as StorageManager from '../src/express/storage/manager';

jest.setTimeout(30000);
const bucketId = 'dd6eb23d7d977568c854b326';
const KeyId = 'ab6eb23d7d977568c854b326';
const newBucket = 'f56eb23d7d977568c854b326';
const newKey = 'a56eb23d7d977568c854b326';

describe('Storage Service', () => {
    let app: Express.Application;

    beforeEach(async () => {
        app = Server.createExpressApp();
    });

    afterEach(async () => {
        StorageManager.deleteFiles(bucketId, [KeyId]);
    });

    describe('api/storage', () => {
        describe('POST', () => {
            it('should upload file with status code 200', async () => {
                const result = await request(app)
                    .post(`/api/storage/bucket/${bucketId}/key/${KeyId}`)
                    .set('Content-Type', 'multipart/form-data')
                    .field('file', fs.createReadStream('./tests/test.txt'));
                expect(result.status).toEqual(200);
            });
            it('should fail uploading file', async () => {
                const result = await request(app).post(`/api/storage/bucket/${bucketId}/key/${KeyId}`);
                expect(result.status).toEqual(500);
            });
        });

        describe('GET', () => {
            it('should download file with status code 200', async () => {
                await StorageManager.uploadFile(bucketId, KeyId, fs.createReadStream('./tests/test.txt'));
                const result = await request(app).get(`/api/storage/bucket/${bucketId}/key/${KeyId}`);
                expect(result.status).toEqual(200);
            });
            it('should return 404 if file does not exist', async () => {
                const result = await request(app).get(`/api/storage/bucket/${bucketId}/key/${KeyId}`);
                expect(result.status).toEqual(404);
            });
        });

        describe('DELETE', () => {
            it('should delete file with status code 200', async () => {
                await StorageManager.uploadFile(bucketId, KeyId, fs.createReadStream('./tests/test.txt'));
                return request(app)
                    .delete(`/api/storage/bucket/${bucketId}`)
                    .send({ key: [KeyId] })
                    .expect(200);
            });
            it('should fail validation for unknown fields', () => {
                return request(app)
                    .delete(`/api/storage/bucket/${bucketId}`)
                    .send({ invalidField: 'some value' })
                    .expect(400);
            });
        });

        describe('POST', () => {
            it('should copy file with status code 200', async () => {
                await StorageManager.uploadFile(bucketId, KeyId, fs.createReadStream('./tests/test.txt'));
                return request(app)
                    .post(`/api/storage/copy`)
                    .send({ sourceBucket: bucketId, sourceKey: KeyId, newBucket, newKey })
                    .expect(200);
            });
            it('should fail copying file with status code 404', async () => {
                return request(app)
                    .post(`/api/storage/copy`)
                    .send({ sourceBucket: bucketId, sourceKey: KeyId, newBucket, newKey })
                    .expect(404);
            });
        });

        describe('GET', () => {
            it('should return 200 if file exists or if file does not exist', async () => {
                await StorageManager.uploadFile(bucketId, KeyId, fs.createReadStream('./tests/test.txt'));
                const result = await request(app).get(`/api/storage/exists/bucket/${bucketId}/key/${KeyId}`);
                expect(result.status).toEqual(200);
            });
        });

        describe('GET', () => {
            it('should return file stats with status code 200', async () => {
                await StorageManager.uploadFile(bucketId, KeyId, fs.createReadStream('./tests/test.txt'));
                const result = await request(app).get(`/api/storage/stat/bucket/${bucketId}/key/${KeyId}`);
                expect(result.status).toEqual(200);
            });
            it('should fail returning file stats with status code 404', async () => {
                const result = await request(app).get(`/api/storage/stat/bucket/${bucketId}/key/${KeyId}`);
                expect(result.status).toEqual(404);
            });
        });
    });
});
