import { Router } from 'express';
import { CavalierController } from '../controllers/cavalierController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, CavalierController.getAllCavaliers);
router.get('/:id', authenticateToken, CavalierController.getCavalierById);
router.get('/club/:clubId', authenticateToken, CavalierController.getCavaliersByClub);
router.post('/create', authenticateToken, requireSuperAdmin, CavalierController.createCavalier);
router.put('/:id', authenticateToken, requireSuperAdmin, CavalierController.updateCavalier);
router.delete('/:id', authenticateToken, requireSuperAdmin, CavalierController.deleteCavalier);

export default router;
