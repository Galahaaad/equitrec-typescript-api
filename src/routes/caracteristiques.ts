import express from 'express';
import { CaracteristiqueController } from '../controllers/caracteristiqueController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

router.get('/', authenticateToken, CaracteristiqueController.getAllCaracteristiques);

router.get('/:id', authenticateToken, CaracteristiqueController.getCaracteristiqueById);

router.get('/epreuve/:epreuveId', authenticateToken, CaracteristiqueController.getCaracteristiquesByEpreuve);

router.post('/create', authenticateToken, requireRole(['SUPER_ADMIN']), CaracteristiqueController.createCaracteristique);

router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), CaracteristiqueController.updateCaracteristique);

router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), CaracteristiqueController.deleteCaracteristique);

router.post('/epreuve/:epreuveId/assign', authenticateToken, requireRole(['SUPER_ADMIN', 'JUGE']), CaracteristiqueController.assignCaracteristiqueToEpreuve);

router.delete('/epreuve/:epreuveId/caracteristique/:caracteristiqueId', authenticateToken, requireRole(['SUPER_ADMIN', 'JUGE']), CaracteristiqueController.removeCaracteristiqueFromEpreuve);

export default router;