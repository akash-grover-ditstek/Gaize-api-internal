import { v4 as uuidv4 } from 'uuid';
import * as Time from '../utils/time.js';
export default {
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    organizationName: {
        type: String,
        require: true
    },
    bucketPrefix: {
        type: String,
        required: false
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: String,
        required: false,
        default: ""
    },
    appMode: {
        type: String,
        required: false,
        default: "Detection"
    },
    createdAt: {
        type: Number,
        required: true,
        default: Time.now()
    },
};