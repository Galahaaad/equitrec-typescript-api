import { Router } from 'express';
import { NiveauController } from '../controllers/niveauController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, NiveauController.getAllNiveaux);
router.get('/:id', authenticateToken, NiveauController.getNiveauById);

router.post('/create', authenticateToken, requireSuperAdmin, NiveauController.createNiveau);
router.put('/:id', authenticateToken, requireSuperAdmin, NiveauController.updateNiveau);
router.delete('/:id', authenticateToken, requireSuperAdmin, NiveauController.deleteNiveau);

export default router;