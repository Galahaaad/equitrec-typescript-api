import { Router } from 'express';
import { QRCodeController } from '../controllers/qrCodeController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.post('/validate', QRCodeController.validateQRCode);

router.post('/generate', authenticateToken, requireSuperAdmin, QRCodeController.generateQRForJudge);
router.post('/generate/bulk/:competitionId', authenticateToken, requireSuperAdmin, QRCodeController.generateBulkQRCodes);
router.get('/status/:competitionId', authenticateToken, requireSuperAdmin, QRCodeController.getCompetitionQRStatus);

export default router;