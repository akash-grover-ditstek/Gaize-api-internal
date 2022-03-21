import {
    Router
} from 'express';
const router = Router();
import controller from '../controller/controller.js';
// const {user} = controller;
router.post('/register', controller.user.register);
router.post('/updateUser', controller.user.updateUser);
router.get('/getUserData', controller.user.getUserData);
router.post('/getUserByEmail', controller.user.getUserByEmail);


export default router