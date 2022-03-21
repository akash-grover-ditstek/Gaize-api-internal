import { Router } from 'express';
const router = Router();
import controller from '../controller/controller.js';

router.route('/create').post(controller.organization.createOrganization);
router.route('/getBucketPrefix').get(controller.organization.getBucketPrefix);

// router.route('/create-stripe-customer').post(controller.organization.createStripeCustomer);


export default router