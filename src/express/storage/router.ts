import { Router } from 'express';
import { wrapController } from '../../utils/express';
import ValidateRequest from '../../utils/joi';
import FeatureController from './controller';
import { CopySchema, DefaultSchema, DeleteSchema } from './validator.schema';

const featureRouter: Router = Router();

featureRouter.post(
    '/bucket/:bucket/key/:key',
    ValidateRequest(DefaultSchema),
    wrapController(FeatureController.uploadFile),
);

featureRouter.get(
    '/bucket/:bucket/key/:key',
    ValidateRequest(DefaultSchema),
    wrapController(FeatureController.downloadFile),
);

featureRouter.delete('/bucket/:bucket', ValidateRequest(DeleteSchema), wrapController(FeatureController.deleteFiles));

featureRouter.post('/copy', ValidateRequest(CopySchema), wrapController(FeatureController.copyFile));

featureRouter.get(
    '/exists/bucket/:bucket/key/:key',
    ValidateRequest(DefaultSchema),
    wrapController(FeatureController.fileExists),
);

featureRouter.get(
    '/stat/bucket/:bucket/key/:key',
    ValidateRequest(DefaultSchema),
    wrapController(FeatureController.statFile),
);

export default featureRouter;
