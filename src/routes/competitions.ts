import { Router } from 'express';
import { CompetitionController } from '../controllers/competitionController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, CompetitionController.getAllCompetitions);
router.get('/upcoming', authenticateToken, CompetitionController.getUpcomingCompetitions);
router.get('/date/:date', authenticateToken, CompetitionController.getCompetitionsByDate);
router.get('/:id', authenticateToken, CompetitionController.getCompetitionById);
router.get('/:id/judges', authenticateToken, CompetitionController.getCompetitionWithJudges);
router.get('/:id/epreuves', authenticateToken, CompetitionController.getCompetitionWithEpreuves);
router.get('/:id/cavaliers', authenticateToken, CompetitionController.getCompetitionWithCavaliers);

router.post('/create', authenticateToken, requireSuperAdmin, CompetitionController.createCompetition);
router.put('/:id', authenticateToken, requireSuperAdmin, CompetitionController.updateCompetition);
router.delete('/:id', authenticateToken, requireSuperAdmin, CompetitionController.deleteCompetition);

router.post('/:id/assign-judge', authenticateToken, requireSuperAdmin, CompetitionController.assignJudgeToCompetition);
router.delete('/:competitionId/judges/:judgeId', authenticateToken, requireSuperAdmin, CompetitionController.removeJudgeFromCompetition);

router.post('/:id/assign-epreuve', authenticateToken, requireSuperAdmin, CompetitionController.addEpreuveToCompetition);
router.delete('/:competitionId/epreuves/:epreuveId', authenticateToken, requireSuperAdmin, CompetitionController.removeEpreuveFromCompetition);

router.get('/:id/participations', authenticateToken, CompetitionController.getParticipationsByCompetition);

router.post('/:id/validate', authenticateToken, requireSuperAdmin, CompetitionController.validateCompetition);

export default router;