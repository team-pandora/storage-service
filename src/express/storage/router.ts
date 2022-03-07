import { Router } from 'express';
import { wrapController } from '../../utils/express';
import FeatureController from './controller';

const featureRouter: Router = Router();

featureRouter.post('/upload', wrapController(FeatureController.upload));

featureRouter.post('/download', wrapController(FeatureController.download));

export default featureRouter;
