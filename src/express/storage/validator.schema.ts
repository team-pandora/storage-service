import * as Joi from 'joi';
import { JoiMongoObjectId } from '../../utils/joi';

export const UploadSchema = Joi.object({
    headers: Joi.object({
        'content-type': Joi.string()
            .regex(/.*multipart\/form-data.*/)
            .required(),
    }).unknown(),
    query: {},
    params: { bucketName: JoiMongoObjectId.required(), objectName: JoiMongoObjectId.required() },
    body: {},
});

export const DefaultSchema = Joi.object({
    query: {},
    params: {
        bucketName: JoiMongoObjectId.required(),
        objectName: JoiMongoObjectId.required(),
    },
    body: {},
});

export const DeleteFilesSchema = Joi.object({
    query: {},
    params: {
        bucketName: JoiMongoObjectId.required(),
    },
    body: {
        objectsList: Joi.array().items(JoiMongoObjectId.required()).min(1).required(),
    },
});

export const CopySchema = Joi.object({
    query: {},
    params: {},
    body: {
        bucketName: JoiMongoObjectId.required(),
        objectName: JoiMongoObjectId.required(),
        sourceBucket: JoiMongoObjectId.required(),
        sourceObject: JoiMongoObjectId.required(),
    },
});

export const DeleteFileSchema = Joi.object({
    query: {},
    params: {
        bucketName: JoiMongoObjectId.required(),
        objectName: JoiMongoObjectId.required(),
    },
    body: {},
});
