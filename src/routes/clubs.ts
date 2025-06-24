import { Router } from 'express';
import { ClubController } from '../controllers/clubController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, ClubController.getAllClubs);
router.get('/:id', authenticateToken, ClubController.getClubById);

export default router;
