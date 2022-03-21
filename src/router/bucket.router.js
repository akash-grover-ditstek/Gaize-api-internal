import { Router } from 'express';
const router = Router();
import {getData,viewFile } from "../controller/bucket.controller.js";

    
router.route('/').post(getData);
router.route('/viewfile').post(viewFile);



export default router