import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as aboutController from '../controllers/aboutController.js';

const router = express.Router();

router.get('/', aboutController.getAbout);
router.put('/', protect, admin, aboutController.updateAbout);
router.post('/members', protect, admin, aboutController.addGuildMember);
router.put('/members/:memberId', protect, admin, aboutController.updateGuildMember);
router.delete('/members/:memberId', protect, admin, aboutController.deleteGuildMember);

export default router;
