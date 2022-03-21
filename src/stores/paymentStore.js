import mongoose from 'mongoose';
import PaymentMongo from '../models/Payment.js';

export const PaymentSchema = new mongoose.Schema(PaymentMongo);
export const Payment = mongoose.model('Payment', PaymentSchema);

export default class PaymentStore {
  async createPayment(attributes) {
    const {
      stripeCustomerId,
      stripeSubscriptionId,
      subTotal,
      total,
      paymentDate,
      chargeId,
      status,
      organizationId,
      createdAt
    } = attributes;

    const newFields = {
      stripeCustomerId,
      stripeSubscriptionId,
      subTotal,
      total,
      paymentDate,
      chargeId,
      status,
      organizationId,
      createdAt
    };

    let result;
    const payment = new Payment(newFields);

    try {
      result = await payment.save();
    } catch (e) {
      console.error(e);
      return Promise.reject(new PaymentStore.OPERATION_UNSUCCESSFUL());
    }
    return result;
  }


  async findCampaignsForInvoice(attributes){
    const { organizationId, start, end } = attributes;
    const filters = {
        organizationId, 
        status: {$ne: CampaignStatus.Deleted},
        "executionTimings.endAt": {
            $gte: start,
            $lte: end,
        }
    }

    let campaigns
    try {
        campaigns = await Campaign.find(filters)
    } catch (error) {
        return Promise.reject(new CampaignStore.OPERATION_UNSUCCESSFUL());
    }

    return campaigns
}


  async getPayments(attributes){

    const { organizationId } = attributes;
    const filters = {
        organizationId
    }

    let payments;
    try {
      payments = await Payment.find(filters);
      // console.log(payments);
      // if(!payments){
      //   return Promise.reject(new PaymentStore.NOT_FOUND());
      // }
    } catch (e) {
      console.error(e);
      return Promise.reject(new PaymentStore.OPERATION_UNSUCCESSFUL());
    }
    return payments;
  }


}


PaymentStore.NOT_FOUND = class extends Error {
  constructor() {
    super('Payment Not Found');
  }
};

PaymentStore.OPERATION_UNSUCCESSFUL = class extends Error {
  constructor() {
    super('An error occured while processing the request.');
  }
};