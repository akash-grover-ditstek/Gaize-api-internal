import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import Joi from 'joi';
import StatusCodes from '../utils/StatusCodes.js';
import ApiResponse from '../utils/apiResponse.js';
import controller from './controller.js'
import Subscription from '../models/Subscription.js';
import SubscriptionStore from '../stores/subscriptionStore.js';
import UserStore from '../stores/userStore.js'
const Storage = new SubscriptionStore();
const userStorage = new UserStore();
export default class StripeController {

    async createStripeCustomer(req, res) {

        const {
            error,
            value
        } = Joi.object().keys({
            userName: Joi.string().required(),
            cardToken: Joi.string().required(),
        }).validate(req.body);

        const {
            userName,
            cardToken
        } = value;

        // Get User Data
        let user
        try {
            user = await controller.user.getUser({
                userName
            }, res, true);
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // Get Organization Data
        let organization
        try {
            organization = await controller.organization.getOrganization({
                userId: user._id
            }, res, true);
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // Create Stripe Customer
        let customer
        try {
            customer = await stripe.customers.create({
                source: cardToken,
                name: organization.organizationName,
                email: user.email,
                // payment_method:paymentId.id,
                description: `Customer: ${ organization.organizationName}`,
                metadata: {
                    userId: user._id,
                    organization: organization._id,
                },
            });
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }
        // Save Stripe Customer ID in organization Table

        let subscription
        if (customer) {
            // create subscription
            const subscriptionAttribute = {
                customerId: customer.id,
                organizationId: organization._id,
            }
            const req = {
                body: subscriptionAttribute
            }
            subscription = await controller.stripe.createSubscription(req, res, false);
        }

    }


    async createSubscription(req, res, returnResponse = false) {
        const {
            error,
            value
        } = Joi.object().keys({
            customerId: Joi.string().required(),
            organizationId: Joi.string().required(),
        }).validate(req.body);
        const {
            customerId,
            organizationId
        } = value
        let subscription
        let saveSubscription
        let result
        try {
            subscription = await stripe.subscriptions.create({
                customer: customerId, //stripe customer ID
                items: [{
                    price_data: {
                        unit_amount: process.env.MONTHLY_SUBSCRIPTION_FEE * 100,
                        product: process.env.STRIPE_PRODUCT_ID,
                        currency: "USD",
                        recurring: {
                            interval: process.env.STRIPE_INTERVAL
                        }
                    }
                }],
                metadata: {
                    organization: organizationId,
                },
            });

            // Save Subscription details
            if (subscription) {
                let subAttribute = {
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscription.id,
                    organizationId: organizationId,
                    cycleStartAt: subscription.current_period_start,
                    cycleEndAt: subscription.current_period_end,
                    subscriptionInterval: process.env.STRIPE_INTERVAL,
                    // status:(subscriptionObj.data.object.status == 'paid')?'active':'inactive'
                }
                saveSubscription = await controller.stripe.saveSubscriptionDetails(subAttribute);
                // save subscriptionID to organization
                let orgAttributes = {
                    organizationId: organizationId,
                    subscriptionId: saveSubscription._id
                }
                try {
                    result = await controller.organization.saveSubscriptionId(orgAttributes)
                } catch (error) {
                    return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
                }
            }

        } catch (e) {
            if (returnResponse) {
                throw e;
            }
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
        }
        if (returnResponse) {
            return result;
        }
        return ApiResponse.success(res, {
            subscription,
            result
        });
    }

    async saveSubscriptionDetails(subAttribute) {

        let subscription
        try {
            subscription = await Storage.createSubscription(subAttribute);
            if (!subscription) {
                return Promise.reject(new SubscriptionStore.NOT_FOUND());
            }
        } catch (e) {
            console.error(e);
            return Promise.reject(new SubscriptionStore.OPERATION_UNSUCCESSFUL());
        }
        return subscription;

    }


    async getCardinfo(req, res, next) {
        let cardInfo;

        // Get User Data
        let user
        try {
            user = await controller.user.getUser(req);
            if (!user) {
                return ApiResponse.error(res, StatusCodes.NOT_FOUND);
            }
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // Get Organization Data
        let organization
        try {
            organization = await controller.organization.getOrganization({
                userId: user._id
            });
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        //Get subscription info
        let subscription;
        try {
            subscription = await Storage.getSubscription({
                organizationId: organization._id
            });
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // get card info from stripe
        if (subscription) {
            let cardDetail
            try {
                cardDetail = await stripe.customers.listSources(
                    subscription.stripeCustomerId, {
                        object: 'card',
                        limit: 1
                    }
                );
            } catch (error) {
                return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
            }
            if (cardDetail) {
                if (cardDetail.data.length) {
                    cardInfo = cardDetail.data.map(item => ({
                        card: item.id,
                        expiryMonth: item.exp_month,
                        expiryYear: item.exp_year,
                        brand: item.brand,
                        country: item.country,
                        cardNumber: item.last4
                    }));
                }
            }
            return ApiResponse.success(res, {
                subscription,
                cardInfo
            });

        } else {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, "Subscription Not Found");
        }
    }



    async updateCard(req, res, next) {

        const {
            error,
            value
        } = Joi.object().keys({
            cardToken: Joi.string().required(),
        }).validate(req.body);

        const {
            cardToken
        } = value;
        const {
            userName
        } = req;

        let oldCards;
        let newCardInfo;
        // Get User Data
        let user
        try {
            user = await controller.user.getUser(req, res, true);
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }
        
        // Get Organization Data
        let organization
        try {
            organization = await controller.organization.getOrganization({
                userId: user._id
            }, res, true);
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }
        //Get subscription info
        let subscription;
        try {
            subscription = await Storage.getSubscription({
                organizationId: organization._id
            });
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // Get old card
        try {
            oldCards = await stripe.customers.listSources(
                subscription.stripeCustomerId, {
                    object: 'card',
                    limit: 1
                },
            );
        } catch (e) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
        }

        // add new card to customer
        try {
            newCardInfo = await stripe.customers.createSource(
                subscription.stripeCustomerId, {
                    source: cardToken
                },
            );
        } catch (e) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
        }


        // Delete old card
        if (oldCards && oldCards.data && oldCards.data.length && oldCards.data.length > 0) {
            try {
                await stripe.customers.deleteSource(
                    subscription.stripeCustomerId,
                    oldCards.data[0].id,
                );
            } catch (e) {
                return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
            }
        }
        return ApiResponse.success(res, {});
    }


    async cancelSubscription(req, res, next) {
        const {
            error,
            value
        } = Joi.object().keys({
            cardToken: Joi.string().required(),
        }).validate(req.body);

        const {
            cardToken
        } = value;

        const {
            userName
        } = req;
        let oldCards;
        let result;
        let subscriptionStatus
        // Get User Data
        let user
        try {
            user = await controller.user.getUser(req, res);
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // Get Organization Data
        let organization
        try {
            organization = await controller.organization.getOrganization({
                userId: user._id
            });
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }
        //Get subscription info
        let subscription;
        try {
            subscription = await Storage.getSubscription({
                _id: organization.subscriptionId
            });
        } catch (error) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
        }

        // Get old card
        try {
            oldCards = await stripe.customers.listSources(
                subscription.stripeCustomerId, {
                    object: 'card',
                    limit: 1
                },
            );
        } catch (e) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
        }

        //Cancel Subscription
        try {
            result = await stripe.subscriptions.del(
                subscription.stripeSubscriptionId
            );
        } catch (e) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
        }

        //Update Subscription status to inactive in subscription Table
        try {
            subscriptionStatus = await Storage.updateSubscription(subscription._id, {
                status: 'inactive'
            });
        } catch (e) {
            return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
        }

        return ApiResponse.success(res, {
            subscriptionStatus
        });

    }

    async getSubscriptionDeatil(attributes) {
        let subscription;
        subscription = await Storage.getSubscription(attributes);
        return subscription;
    }


}
