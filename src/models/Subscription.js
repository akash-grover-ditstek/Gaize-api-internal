import { v4 as uuidv4 } from 'uuid';
import * as Time from '../utils/time.js';

export default {
  _id: {
    type: String,
    default:()=>  uuidv4(),
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
  },
  organizationId: {
    type: String,
    ref:'Organization',
    required: true,
  },
  cycleStartAt: {
    type: Number,
    required: true,
  },
  cycleEndAt: {
    type: Number,
    required: true,
  },
  subscriptionInterval: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Number,
    required: true,
    default:Time.now()
},
};
