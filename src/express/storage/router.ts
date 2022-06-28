import { Router } from 'express';
import { wrapController } from '../../utils/express';
import ValidateRequest from '../../utils/joi';
import * as FeatureController from './controller';
import * as ValidatorSchemas from './validator.schema';

const featureRouter: Router = Router();

featureRouter.post(
    '/bucket/:bucketName/object/:objectName',
    ValidateRequest(ValidatorSchemas.UploadFileRequestSchema),
    wrapController(FeatureController.uploadFile),
);

featureRouter.get(
    '/bucket/:bucketName/object/:objectName',
    ValidateRequest(ValidatorSchemas.FileExistsRequestSchema),
    wrapController(FeatureController.downloadFile),
);

featureRouter.delete(
    '/bucket/:bucketName/object/:objectName',
    ValidateRequest(ValidatorSchemas.DeleteFileRequestSchema),
    wrapController(FeatureController.deleteFile),
);

featureRouter.delete(
    '/bucket/:bucketName',
    ValidateRequest(ValidatorSchemas.DeleteFilesRequestSchema),
    wrapController(FeatureController.deleteFiles),
);

featureRouter.post(
    '/bucket/:bucketName/object/:objectName/copy',
    ValidateRequest(ValidatorSchemas.CopyFileRequestSchema),
    wrapController(FeatureController.copyFile),
);

featureRouter.get(
    '/bucket/:bucketName/object/:objectName/exists',
    ValidateRequest(ValidatorSchemas.FileExistsRequestSchema),
    wrapController(FeatureController.fileExists),
);

featureRouter.get(
    '/bucket/:bucketName/object/:objectName/stat',
    ValidateRequest(ValidatorSchemas.StatFileRequestSchema),
    wrapController(FeatureController.statFile),
);

export default featureRouter;
