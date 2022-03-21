import mongoose from 'mongoose';
import SubscriptionMongo from '../models/Subscription.js';

export const SubscriptionSchema = new mongoose.Schema(SubscriptionMongo);
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export default class SubscriptionStore {
  async createSubscription(attributes) {
    const {
      organizationId,
      stripeCustomerId,
      stripeSubscriptionId,
      cycleStartAt,
      cycleEndAt,
      subscriptionInterval,
      createdAt
    } = attributes;

    const newFields = {
        organizationId,
        stripeCustomerId,
        stripeSubscriptionId,
        cycleStartAt,
        cycleEndAt,
        subscriptionInterval,
        createdAt
      };

    let saveSubscription;
    const sub = new Subscription(newFields);

    try {
        saveSubscription = await sub.save();
    } catch (e) {
      console.error(e);
      return Promise.reject(new SubscriptionStore.OPERATION_UNSUCCESSFUL());
    }

    return saveSubscription;
  }


  async getSubscription(attributes){
    let subscription;
    try {
      subscription = await Subscription.findOne(attributes);
      if(!subscription){
        return Promise.reject(new SubscriptionStore.NOT_FOUND());
      }
    } catch (e) {
      return Promise.reject(new SubscriptionStore.OPERATION_UNSUCCESSFUL());
    }
    return subscription;
  }


  async updateSubscription(id,attributes){
    let subscription;
    try {
      subscription = await Subscription.findOneAndUpdate({ _id: id }, attributes, { new: true });
      if(!subscription){
        return Promise.reject(new SubscriptionStore.NOT_FOUND());
      }
    } catch (e) {
      console.error(e);
      return Promise.reject(new SubscriptionStore.OPERATION_UNSUCCESSFUL());
    }
    return subscription;
  }

}


SubscriptionStore.NOT_FOUND = class extends Error {
  constructor() {
    super('Subscription Not Found');
  }
};

SubscriptionStore.OPERATION_UNSUCCESSFUL = class extends Error {
  constructor() {
    super('An error occured while processing the request.');
  }
};