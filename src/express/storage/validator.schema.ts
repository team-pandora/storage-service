import * as Joi from 'joi';
import { JoiMongoObjectId } from '../../utils/joi';

const DeleteSchema = Joi.object({
    body: {
        key: Joi.alternatives(JoiMongoObjectId.required(), Joi.array().items(JoiMongoObjectId.required())).required(),
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
    body: {},
    query: {},
    params: {
        sourceBucket: JoiMongoObjectId.required(),
        sourceKey: JoiMongoObjectId.required(),
        newKey: JoiMongoObjectId.required(),
    },
});

export { DeleteSchema, CopySchema, DefaultSchema };
