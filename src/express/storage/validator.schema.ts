import * as Joi from 'joi';
import { JoiObjectId } from '../../utils/joi';

const objectActionParamsSchema = Joi.object({
    bucketName: Joi.string().required(),
    objectName: JoiObjectId.required(),
});

export const UploadFileRequestSchema = Joi.object({
    headers: Joi.object({
        'content-type': Joi.string()
            .regex(/.*multipart\/form-data.*/)
            .required(),
    }).unknown(),
    query: {},
    params: objectActionParamsSchema,
    body: {},
});

export const FileExistsRequestSchema = Joi.object({
    query: {},
    params: objectActionParamsSchema,
    body: {},
});

export const DeleteFilesRequestSchema = Joi.object({
    query: {},
    params: {
        bucketName: JoiObjectId.required(),
    },
    body: {
        objectNames: Joi.array().items(JoiObjectId.required()).min(1).required(),
    },
});

export const CopyFileRequestSchema = Joi.object({
    query: {},
    params: objectActionParamsSchema,
    body: {
        newBucketName: JoiObjectId.required(),
        newObjectName: JoiObjectId.required(),
    },
});

export const DeleteFileRequestSchema = Joi.object({
    query: {},
    params: objectActionParamsSchema,
    body: {},
});

export const StatFileRequestSchema = Joi.object({
    query: {},
    params: objectActionParamsSchema,
    body: {},
});
