import { Router } from 'express';
import { CritereController } from '../controllers/critereController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// Routes publiques pour la consultation (avec authentification)
router.get('/', authenticateToken, CritereController.getAllCriteres);
router.get('/:id', authenticateToken, CritereController.getCritereById);
router.get('/:id/epreuves', authenticateToken, CritereController.getEpreuvesByCritere);

// Routes d'administration (SUPER_ADMIN uniquement)
router.post('/create', authenticateToken, requireSuperAdmin, CritereController.createCritere);
router.put('/:id', authenticateToken, requireSuperAdmin, CritereController.updateCritere);
router.delete('/:id', authenticateToken, requireSuperAdmin, CritereController.deleteCritere);

// Gestion des épreuves (SUPER_ADMIN uniquement)
router.post('/:id/assign-epreuve', authenticateToken, requireSuperAdmin, CritereController.assignEpreuveToCritere);

export default router;