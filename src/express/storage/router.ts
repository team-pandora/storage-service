import { Router } from 'express';
import { wrapController } from '../../utils/express';
import ValidateRequest from '../../utils/joi';
import * as FeatureController from './controller';
import * as ValidatorSchemas from './validator.schema';

const featureRouter: Router = Router();

featureRouter.post(
    '/bucketName/:bucketName/objectName/:objectName',
    ValidateRequest(ValidatorSchemas.UploadSchema),
    wrapController(FeatureController.uploadFile),
);

featureRouter.get(
    '/bucketName/:bucketName/objectName/:objectName',
    ValidateRequest(ValidatorSchemas.DefaultSchema),
    wrapController(FeatureController.downloadFile),
);

featureRouter.delete(
    '/bucketName/:bucketName',
    ValidateRequest(ValidatorSchemas.DeleteFilesSchema),
    wrapController(FeatureController.deleteFiles),
);

featureRouter.post('/copy', ValidateRequest(ValidatorSchemas.CopySchema), wrapController(FeatureController.copyFile));

featureRouter.get(
    '/exists/bucketName/:bucketName/objectName/:objectName',
    ValidateRequest(ValidatorSchemas.DefaultSchema),
    wrapController(FeatureController.fileExists),
);

featureRouter.get(
    '/stat/bucketName/:bucketName/objectName/:objectName',
    ValidateRequest(ValidatorSchemas.DefaultSchema),
    wrapController(FeatureController.statFile),
);

featureRouter.delete(
    '/bucketName/:bucketName/objectName/:objectName',
    ValidateRequest(ValidatorSchemas.DeleteFileSchema),
    wrapController(FeatureController.deleteFile),
);

export default featureRouter;
