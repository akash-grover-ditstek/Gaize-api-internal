import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import StatusCodes from '../utils/StatusCodes.js';
import ApiResponse from '../utils/apiResponse.js';
import controller from './controller.js'
import PaymentStore from '../stores/paymentStore.js';


const Storage = new PaymentStore();

export default class PaymentController {

    async createPayment(req, res) {

        const paymentObject = req.body.data.object
        const paymentInfo = {
            stripeCustomerId: paymentObject.customer,
            stripeSubscriptionId: paymentObject.subscription,
            subTotal: paymentObject.subtotal,
            total: paymentObject.total,
            paymentDate: req.body.created,
            chargeId: paymentObject.charge,
            status: paymentObject.paid,
            organizationId:paymentObject.lines.data[0].metadata.organization
        }
        let payment;
            try {
                payment = await Storage.createPayment(paymentInfo);
                if (!payment) {
                    return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
                }
            } catch (error) {
                return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
            }
        return ApiResponse.success(res, {
            payment
        });
    }

    async getPayments(req, res, next) {

        let payments;
        try {
            const result = await controller.user.getUserData(req, res, next, true);
            if (result) {
                const organizationID = result.organization._id;
                payments = await Storage.getPayments({
                    organizationId: organizationID
                });
            }
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }
        return ApiResponse.success(res, {
            payments
        });
    }

}