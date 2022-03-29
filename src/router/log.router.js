import { Router } from 'express';
const router = Router();
import controller from '../controller/controller.js';

router.route('/create').post(controller.log.create);

export default router;