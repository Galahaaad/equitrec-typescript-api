import { Router } from 'express';
import { CategorieController } from '../controllers/categorieController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, CategorieController.getAllCategories);
router.get('/:id', authenticateToken, CategorieController.getCategorieById);
router.get('/:id/fiches', authenticateToken, CategorieController.getFichesByCategorie);

router.post('/create', authenticateToken, requireSuperAdmin, CategorieController.createCategorie);
router.put('/:id', authenticateToken, requireSuperAdmin, CategorieController.updateCategorie);
router.delete('/:id', authenticateToken, requireSuperAdmin, CategorieController.deleteCategorie);

router.post('/:id/assign-fiche', authenticateToken, requireSuperAdmin, CategorieController.assignFicheToCategorie);

export default router;