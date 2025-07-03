import { Router } from 'express';
import { EpreuveController } from '../controllers/epreuveController';
import { authenticateToken, requireJudgeRole, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, EpreuveController.getAllEpreuves);
router.get('/:id', authenticateToken, EpreuveController.getEpreuveById);
router.get('/:id/competitions', authenticateToken, EpreuveController.getEpreuveWithCompetitions);
router.get('/:id/criteres', authenticateToken, EpreuveController.getEpreuveWithCriteres);
router.get('/juge/:jugeId', authenticateToken, EpreuveController.getEpreuvesByJuge);
router.post('/create', authenticateToken, requireJudgeRole, EpreuveController.createEpreuve);
router.put('/:id', authenticateToken, requireJudgeRole, EpreuveController.updateEpreuve);
router.delete('/:id', authenticateToken, requireJudgeRole, EpreuveController.deleteEpreuve);

// Gestion des compétitions (SUPER_ADMIN uniquement)
router.post('/:id/assign-competition', authenticateToken, requireSuperAdmin, EpreuveController.addCompetitionToEpreuve);
router.delete('/:epreuveId/competitions/:competitionId', authenticateToken, requireSuperAdmin, EpreuveController.removeCompetitionFromEpreuve);

// Gestion des critères (SUPER_ADMIN uniquement)
router.post('/:id/assign-critere', authenticateToken, requireSuperAdmin, EpreuveController.assignCritereToEpreuve);
router.delete('/:epreuveId/criteres/:critereId', authenticateToken, requireSuperAdmin, EpreuveController.removeCritereFromEpreuve);

export default router;