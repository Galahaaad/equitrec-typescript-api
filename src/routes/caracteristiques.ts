import express from 'express';
import { CaracteristiqueController } from '../controllers/caracteristiqueController';
import {authenticateToken, requireSuperAdmin} from "../middlewares/auth";

const router = express.Router();

router.get('/', authenticateToken, CaracteristiqueController.getAllCaracteristiques);

router.get('/:id', authenticateToken, CaracteristiqueController.getCaracteristiqueById);

router.get('/epreuve/:epreuveId', authenticateToken, CaracteristiqueController.getCaracteristiquesByEpreuve);

router.post('/create', authenticateToken, requireSuperAdmin, CaracteristiqueController.createCaracteristique);

router.put('/:id', authenticateToken, require, CaracteristiqueController.updateCaracteristique);

router.delete('/:id', authenticateToken, requireSuperAdmin, CaracteristiqueController.deleteCaracteristique);

router.post('/epreuve/:epreuveId/assign', authenticateToken, requireSuperAdmin, CaracteristiqueController.assignCaracteristiqueToEpreuve);

router.delete('/epreuve/:epreuveId/caracteristique/:caracteristiqueId', authenticateToken, requireSuperAdmin, CaracteristiqueController.removeCaracteristiqueFromEpreuve);

export default router;