import { Router } from 'express';
import { wrapController } from '../../utils/express';
import ValidateRequest from '../../utils/joi';
import { CopyBucketKeySchema, BucketKeySchema } from './validator.schema';
import FeatureController from './controller';

const featureRouter: Router = Router();

featureRouter.post('/upload', wrapController(FeatureController.uploadFile));

featureRouter.get('/download', ValidateRequest(BucketKeySchema), wrapController(FeatureController.downloadFile));

featureRouter.delete('/delete', ValidateRequest(BucketKeySchema), wrapController(FeatureController.deleteFile));

featureRouter.post('/copy', ValidateRequest(CopyBucketKeySchema), wrapController(FeatureController.copyFile));

export default featureRouter;
