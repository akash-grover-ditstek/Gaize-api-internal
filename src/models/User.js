import { v4 as uuidv4 } from 'uuid';
import * as Time from '../utils/time.js';
export default {
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    userName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        require: true,
        default: false
    },
    createdAt: {
        type: Number,
        required: true,
        default: Time.now()
    },
};