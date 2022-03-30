import { Router } from 'express';
import { wrapController } from '../../utils/express';
import ValidateRequest from '../../utils/joi';
import * as FeatureController from './controller';
import * as ValidatorSchemas from './validator.schema';

const featureRouter: Router = Router();

featureRouter.post(
    '/bucket/:bucket/key/:key',
    ValidateRequest(ValidatorSchemas.UploadSchema),
    wrapController(FeatureController.uploadFile),
);

featureRouter.get(
    '/bucket/:bucket/key/:key',
    ValidateRequest(ValidatorSchemas.DefaultSchema),
    wrapController(FeatureController.downloadFile),
);

featureRouter.delete(
    '/bucket/:bucket',
    ValidateRequest(ValidatorSchemas.DeleteSchema),
    wrapController(FeatureController.deleteFiles),
);

featureRouter.post('/copy', ValidateRequest(ValidatorSchemas.CopySchema), wrapController(FeatureController.copyFile));

featureRouter.get(
    '/exists/bucket/:bucket/key/:key',
    ValidateRequest(ValidatorSchemas.DefaultSchema),
    wrapController(FeatureController.fileExists),
);

featureRouter.get(
    '/stat/bucket/:bucket/key/:key',
    ValidateRequest(ValidatorSchemas.DefaultSchema),
    wrapController(FeatureController.statFile),
);

export default featureRouter;
