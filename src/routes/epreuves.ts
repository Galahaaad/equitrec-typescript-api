import { Router } from 'express';
import { EpreuveController } from '../controllers/epreuveController';
import { authenticateToken, requireJudgeRole } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, EpreuveController.getAllEpreuves);
router.get('/:id', authenticateToken, EpreuveController.getEpreuveById);
router.get('/juge/:jugeId', authenticateToken, EpreuveController.getEpreuvesByJuge);
router.post('/create', authenticateToken, requireJudgeRole, EpreuveController.createEpreuve);
router.put('/:id', authenticateToken, requireJudgeRole, EpreuveController.updateEpreuve);
router.delete('/:id', authenticateToken, requireJudgeRole, EpreuveController.deleteEpreuve);

export default router;