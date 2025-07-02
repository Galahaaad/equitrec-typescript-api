import { Router } from 'express';
import { ClubController } from '../controllers/clubController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, ClubController.getAllClubs);
router.get('/:id', authenticateToken, ClubController.getClubById);
router.post('/create', authenticateToken, requireSuperAdmin, ClubController.createClub);
router.delete('/:id', authenticateToken, requireSuperAdmin, ClubController.deleteClub);

export default router;
