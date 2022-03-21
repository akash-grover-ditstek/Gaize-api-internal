import {
  v4 as uuidv4
} from 'uuid';
import * as Time from '../utils/time.js';

export default {
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    required: false,
  },
  organizationId: {
    type: String,
    required: false,
  },
  chargeId: {
    type: String,
    required: false,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
    default: Time.now()
  },
};