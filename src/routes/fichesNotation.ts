import { Router } from 'express';
import { FicheNotationController } from '../controllers/ficheNotationController';
import { authenticateToken, requireJudgeRole, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, FicheNotationController.getAllFichesNotation);
router.get('/:id', authenticateToken, FicheNotationController.getFicheNotationById);
router.get('/:id/categories', authenticateToken, FicheNotationController.getFicheNotationWithCategories);
router.get('/cavalier/:cavalierId', authenticateToken, FicheNotationController.getFichesNotationByCavalier);
router.get('/epreuve/:epreuveId', authenticateToken, FicheNotationController.getFichesNotationByEpreuve);
router.post('/create', authenticateToken, requireJudgeRole, FicheNotationController.createFicheNotation);
router.put('/:id', authenticateToken, requireJudgeRole, FicheNotationController.updateFicheNotation);
router.delete('/:id', authenticateToken, requireJudgeRole, FicheNotationController.deleteFicheNotation);

router.post('/:id/assign-categorie', authenticateToken, requireSuperAdmin, FicheNotationController.assignCategorieToFiche);
router.delete('/:ficheId/categories/:categorieId', authenticateToken, requireSuperAdmin, FicheNotationController.removeCategorieFromFiche);

export default router;
