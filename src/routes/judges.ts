import { Router } from 'express';
import { JugeController } from '../controllers/jugeController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// Routes publiques pour la consultation (avec authentification)
router.get('/', authenticateToken, JugeController.getAllJuges);
router.get('/:id', authenticateToken, JugeController.getJugeById);
router.get('/:id/competitions', authenticateToken, JugeController.getJugeWithCompetitions);

// Routes d'administration (SUPER_ADMIN uniquement)
router.post('/create', authenticateToken, requireSuperAdmin, JugeController.createJuge);
router.put('/:id', authenticateToken, requireSuperAdmin, JugeController.updateJuge);
router.delete('/:id', authenticateToken, requireSuperAdmin, JugeController.deleteJuge);

export default router;