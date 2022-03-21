import { Router } from 'express';
const router = Router();
import controller from '../controller/controller.js';

// router.route('/create').post(controller.organization.createOrganization);
router.route('/createPayment').post(controller.payment.createPayment);
router.route('/getPayments').get(controller.payment.getPayments);

export default router