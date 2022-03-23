import * as Joi from 'joi';
import { JoiMongoObjectId } from '../../utils/joi';

const BucketKeySchema = Joi.object({
    body: {
        bucket: JoiMongoObjectId.required(),
        key: Joi.alternatives(JoiMongoObjectId.required(), Joi.array().items(JoiMongoObjectId.required())).required(),
    },
    query: {},
    params: {},
});

const CopyBucketKeySchema = Joi.object({
    body: {
        sourceBucket: JoiMongoObjectId.required(),
        sourceKey: JoiMongoObjectId.required(),
    },
    query: {},
    params: {},
});

const UploadSchema = Joi.object({
    body: {},
    query: {},
    params: {
        bucket: JoiMongoObjectId.required(),
    },
});

export { BucketKeySchema, CopyBucketKeySchema, UploadSchema };
