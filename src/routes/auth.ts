import express from 'express';
import { login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

export default router;
