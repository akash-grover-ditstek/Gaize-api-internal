import { Router } from 'express';
const router = Router();
import {upload,fileUpload,createFolder } from "../controller/fileUpload.controller.js";

router.post('/upload', fileUpload.single('file'), upload);
router.post('/create',createFolder);

export default router

