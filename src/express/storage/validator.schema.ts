import * as Joi from 'joi';
import { JoiMongoObjectId } from '../../utils/joi';

const DeleteSchema = Joi.object({
    body: {
        key: Joi.array().items(JoiMongoObjectId.required()).min(1).required(),
    },
    query: {},
    params: {
        bucket: JoiMongoObjectId.required(),
    },
});

const DefaultSchema = Joi.object({
    body: {},
    query: {},
    params: {
        bucket: JoiMongoObjectId.required(),
        key: JoiMongoObjectId.required(),
    },
});

const CopySchema = Joi.object({
    body: {
        sourceBucket: JoiMongoObjectId.required(),
        sourceKey: JoiMongoObjectId.required(),
        newBucket: JoiMongoObjectId.required(),
        newKey: JoiMongoObjectId.required(),
    },
    query: {},
    params: {},
});

export { DeleteSchema, CopySchema, DefaultSchema };
