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

router.get('/:id/participations', authenticateToken, CavalierController.getParticipationsByCavalier);
router.post('/:id/participations', authenticateToken, requireSuperAdmin, CavalierController.inscrireCavalierCompetition);
router.delete('/:id/participations/:competitionId', authenticateToken, requireSuperAdmin, CavalierController.retirerParticipationCavalier);
router.put('/:id/participations/:competitionId/niveau', authenticateToken, requireSuperAdmin, CavalierController.changerNiveauParticipationCavalier);

export default router;
