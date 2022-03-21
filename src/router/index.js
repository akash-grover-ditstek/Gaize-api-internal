import { Router } from "express";
const router = Router();

import fileUploadRouter from './fileUpload.router.js';
import bucketRouter from './bucket.router.js';
import organizationRouter from './organization.router.js';
import userRouter from './user.router.js';
import stripeRouter from './stripe.router.js';
import paymentRouter from './payment.router.js';

router.use('/file', fileUploadRouter);
router.use('/bucket', bucketRouter);
router.use('/organization', organizationRouter);
router.use('/user', userRouter);
router.use('/stripe', stripeRouter);
router.use('/payment', paymentRouter);

export default router;