import { Router } from 'express';
import { wrapController } from '../../utils/express';
import ValidateRequest from '../../utils/joi';
import FeatureController from './controller';
import { DeleteSchema, CopySchema, DefaultSchema } from './validator.schema';

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

featureRouter.delete('/bucket/:bucket', ValidateRequest(DeleteSchema), wrapController(FeatureController.deleteFile));

featureRouter.copy(
    '/bucket/:sourceBucket/key/:sourceKey/:newKey',
    ValidateRequest(CopySchema),
    wrapController(FeatureController.copyFile),
);

export default featureRouter;
