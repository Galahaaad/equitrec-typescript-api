import { Router } from 'express';
import { CategorieController } from '../controllers/categorieController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// Routes publiques pour la consultation (avec authentification)
router.get('/', authenticateToken, CategorieController.getAllCategories);
router.get('/:id', authenticateToken, CategorieController.getCategorieById);
router.get('/:id/fiches', authenticateToken, CategorieController.getFichesByCategorie);

// Routes d'administration (SUPER_ADMIN uniquement)
router.post('/create', authenticateToken, requireSuperAdmin, CategorieController.createCategorie);
router.put('/:id', authenticateToken, requireSuperAdmin, CategorieController.updateCategorie);
router.delete('/:id', authenticateToken, requireSuperAdmin, CategorieController.deleteCategorie);

// Gestion des fiches de notation (SUPER_ADMIN uniquement)
router.post('/:id/assign-fiche', authenticateToken, requireSuperAdmin, CategorieController.assignFicheToCategorie);

export default router;