import { v4 as uuidv4 } from 'uuid';
import * as Time from '../utils/time.js';
export default {
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    userId: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    message: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true,
        default: Time.now()
    },
};