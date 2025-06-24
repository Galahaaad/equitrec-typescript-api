import { Router } from 'express';
import { FicheNotationController } from '../controllers/ficheNotationController';
import { authenticateToken, requireJudgeRole } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, FicheNotationController.getAllFichesNotation);
router.get('/:id', authenticateToken, FicheNotationController.getFicheNotationById);
router.get('/cavalier/:cavalierId', authenticateToken, FicheNotationController.getFichesNotationByCavalier);
router.post('/create', authenticateToken, requireJudgeRole, FicheNotationController.createFicheNotation);
router.put('/:id', authenticateToken, requireJudgeRole, FicheNotationController.updateFicheNotation);
router.delete('/:id', authenticateToken, requireJudgeRole, FicheNotationController.deleteFicheNotation);

export default router;
