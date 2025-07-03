import { Router } from 'express';
import { CritereController } from '../controllers/critereController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, CritereController.getAllCriteres);
router.get('/:id', authenticateToken, CritereController.getCritereById);
router.get('/:id/epreuves', authenticateToken, CritereController.getEpreuvesByCritere);

router.post('/create', authenticateToken, requireSuperAdmin, CritereController.createCritere);
router.put('/:id', authenticateToken, requireSuperAdmin, CritereController.updateCritere);
router.delete('/:id', authenticateToken, requireSuperAdmin, CritereController.deleteCritere);

router.post('/:id/assign-epreuve', authenticateToken, requireSuperAdmin, CritereController.assignEpreuveToCritere);

export default router;