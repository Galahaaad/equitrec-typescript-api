import { Request, Response } from 'express';
import { QRCodeService } from '../services/qrCodeService';

export class QRCodeController {

    static async generateQRForJudge(req: Request, res: Response): Promise<void> {
        try {
            const { competitionId, judgeId } = req.body;

            if (!competitionId || !judgeId) {
                res.status(400).json({
                    success: false,
                    message: 'competitionId et judgeId sont requis'
                });
                return;
            }

            if (isNaN(competitionId) || isNaN(judgeId)) {
                res.status(400).json({
                    success: false,
                    message: 'competitionId et judgeId doivent être des nombres'
                });
                return;
            }

            const qrResponse = await QRCodeService.generateQRCodeForJudge({
                competitionId: parseInt(competitionId),
                judgeId: parseInt(judgeId)
            });

            res.status(201).json({
                ...qrResponse,
                message: 'QR Code généré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la génération du QR Code:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la génération du QR Code'
            });
        }
    }

    static async generateBulkQRCodes(req: Request, res: Response): Promise<void> {
        try {
            const competitionId = parseInt(req.params.competitionId);

            if (isNaN(competitionId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de compétition invalide'
                });
                return;
            }

            const qrCodes = await QRCodeService.generateBulkQRCodes(competitionId);

            res.json({
                success: true,
                data: {
                    competitionId,
                    qrCodes,
                    count: qrCodes.length
                },
                message: `${qrCodes.length} QR Code(s) généré(s) avec succès`
            });
        } catch (error) {
            console.error('Erreur lors de la génération en masse des QR Codes:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la génération des QR Codes'
            });
        }
    }

    static async validateQRCode(req: Request, res: Response): Promise<void> {
        try {
            const { qrToken } = req.body;

            if (!qrToken) {
                res.status(400).json({
                    success: false,
                    message: 'Token QR requis'
                });
                return;
            }

            const validationResponse = await QRCodeService.validateQRCode({ qrToken });

            res.json({
                ...validationResponse,
                message: 'QR Code validé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la validation du QR Code:', error);

            let statusCode = 400;
            let message = 'QR Code invalide';
            
            if (error instanceof Error) {
                if (error.message.includes('expiré')) {
                    statusCode = 401;
                    message = 'QR Code expiré';
                } else if (error.message.includes('invalide') || error.message.includes('corrompu')) {
                    statusCode = 401;
                    message = 'QR Code invalide';
                } else if (error.message.includes('jour de la compétition')) {
                    statusCode = 403;
                    message = 'QR Code utilisable uniquement le jour de la compétition';
                } else {
                    message = error.message;
                }
            }

            res.status(statusCode).json({
                success: false,
                message
            });
        }
    }

    static async getCompetitionQRStatus(req: Request, res: Response): Promise<void> {
        try {
            const competitionId = parseInt(req.params.competitionId);

            if (isNaN(competitionId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de compétition invalide'
                });
                return;
            }

            const status = await QRCodeService.getCompetitionQRStatus(competitionId);

            res.json({
                success: true,
                data: status,
                message: 'Statut QR de la compétition récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du statut QR:', error);
            if (error instanceof Error && error.message === 'Compétition non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération du statut QR'
                });
            }
        }
    }
}