import { Router } from 'express';
import { FicheNotationController } from '../controllers/ficheNotationController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, FicheNotationController.getAllFichesNotation);
router.get('/:id', authenticateToken, FicheNotationController.getFicheNotationById);
router.get('/cavalier/:cavalierId', authenticateToken, FicheNotationController.getFichesNotationByCavalier);
router.post('/create', authenticateToken, requireSuperAdmin, FicheNotationController.createFicheNotation);
router.put('/:id', authenticateToken, requireSuperAdmin, FicheNotationController.updateFicheNotation);
router.delete('/:id', authenticateToken, requireSuperAdmin, FicheNotationController.deleteFicheNotation);

export default router;
