import express from 'express';
import { MaterielController } from '../controllers/materielController';
import {authenticateToken, requireSuperAdmin} from "../middlewares/auth";

const router = express.Router();

router.get('/', authenticateToken, MaterielController.getAllMateriels);

router.get('/:id', authenticateToken, MaterielController.getMaterielById);

router.get('/epreuve/:epreuveId', authenticateToken, MaterielController.getMaterielsByEpreuve);

router.post('/create', authenticateToken, requireSuperAdmin, MaterielController.createMateriel);

router.put('/:id', authenticateToken, requireSuperAdmin, MaterielController.updateMateriel);

router.delete('/:id', authenticateToken, requireSuperAdmin, MaterielController.deleteMateriel);

router.post('/epreuve/:epreuveId/assign', authenticateToken, requireSuperAdmin, MaterielController.assignMaterielToEpreuve);

router.put('/epreuve/:epreuveId/materiel/:materielId/quantite', authenticateToken, requireSuperAdmin, MaterielController.updateMaterielQuantiteForEpreuve);

router.delete('/epreuve/:epreuveId/materiel/:materielId', authenticateToken, requireSuperAdmin, MaterielController.removeMaterielFromEpreuve);

export default router;