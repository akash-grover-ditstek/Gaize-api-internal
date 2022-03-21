import { Router } from 'express';
const router = Router();
import controller from '../controller/controller.js';

// router.route('/create').post(controller.organization.createOrganization);
router.route('/create-customer').post(controller.stripe.createStripeCustomer);
router.route('/getCardInfo').get(controller.stripe.getCardinfo);
router.route('/updateCard').post(controller.stripe.updateCard);
router.route('/cancelSubscription').get(controller.stripe.cancelSubscription);

export default router