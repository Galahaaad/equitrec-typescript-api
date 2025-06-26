import jwt from 'jsonwebtoken';
import config from '../config';
import { CompetitionService } from './competitionService';
import { JugeService } from './jugeService';
import { UserModel } from '../models/User';
import { pool } from '../config/database';

export interface QRTokenPayload {
    judgeId: number;
    competitionId: number;
    competitionDate: string;
    exp: number;
    iat: number;
    qrAuth: true;
    type: 'competition_qr';
}

export interface GenerateQRRequest {
    competitionId: number;
    judgeId: number;
}

export interface GenerateQRResponse {
    success: true;
    data: {
        qrToken: string;
        qrData: string; // JSON pour le QR Code
        judgeInfo: {
            idjuge: number;
            nomjuge: string;
            prenomjuge: string;
        };
        competitionInfo: {
            idcompetition: number;
            datecompetition: Date;
        };
        expiresAt: Date;
    };
}

export interface ValidateQRRequest {
    qrToken: string;
}

export interface ValidateQRResponse {
    success: true;
    data: {
        permanentToken: string;
        user: {
            idutilisateur: number;
            nomutilisateur: string;
            prenomutilisateur: string;
            username: string;
            idjuge: number;
            idrole: number;
        };
        competition: {
            idcompetition: number;
            datecompetition: Date;
        };
        message: string;
    };
}

export class QRCodeService {
    private static userModel = new UserModel(pool);

    static async generateQRCodeForJudge(request: GenerateQRRequest): Promise<GenerateQRResponse> {
        try {
            // Vérifier que la compétition existe
            const competition = await CompetitionService.getCompetitionById(request.competitionId);
            
            // Vérifier que le juge existe et est assigné à cette compétition
            const judgesInCompetition = await JugeService.getJugesByCompetition(request.competitionId);
            const assignedJudge = judgesInCompetition.find(j => j.idjuge === request.judgeId);
            
            if (!assignedJudge) {
                throw new Error('Ce juge n\'est pas assigné à cette compétition');
            }

            // Vérifier que le juge a un compte utilisateur avec le rôle JUDGE
            const userQuery = `
                SELECT u.* FROM utilisateur u 
                WHERE u.idjuge = $1 AND u.idrole = 3
            `;
            const userResult = await pool.query(userQuery, [request.judgeId]);
            
            if (userResult.rows.length === 0) {
                throw new Error('Ce juge n\'a pas de compte utilisateur avec le rôle JUDGE');
            }

            // Calculer l'expiration : fin de la journée de compétition
            const competitionDate = new Date(competition.datecompetition);
            const expiresAt = new Date(competitionDate);
            expiresAt.setHours(23, 59, 59, 999); // Fin de journée

            // Créer le payload JWT
            const payload: QRTokenPayload = {
                judgeId: request.judgeId,
                competitionId: request.competitionId,
                competitionDate: competitionDate.toISOString().split('T')[0],
                exp: Math.floor(expiresAt.getTime() / 1000),
                iat: Math.floor(Date.now() / 1000),
                qrAuth: true,
                type: 'competition_qr'
            };

            // Générer le token JWT
            const qrToken = jwt.sign(payload, config.jwt.secret);

            // Données pour le QR Code (format JSON)
            const qrData = JSON.stringify({
                token: qrToken,
                competition: competition.idcompetition,
                judge: assignedJudge.idjuge,
                date: competitionDate.toISOString().split('T')[0]
            });

            return {
                success: true,
                data: {
                    qrToken,
                    qrData,
                    judgeInfo: {
                        idjuge: assignedJudge.idjuge,
                        nomjuge: assignedJudge.nomjuge,
                        prenomjuge: assignedJudge.prenomjuge
                    },
                    competitionInfo: {
                        idcompetition: competition.idcompetition,
                        datecompetition: competition.datecompetition
                    },
                    expiresAt
                }
            };

        } catch (error) {
            console.error('Erreur lors de la génération du QR Code:', error);
            throw error;
        }
    }

    static async validateQRCode(request: ValidateQRRequest): Promise<ValidateQRResponse> {
        try {
            // Vérifier et décoder le token JWT
            const decoded = jwt.verify(request.qrToken, config.jwt.secret) as QRTokenPayload;

            // Vérifications de sécurité
            if (!decoded.qrAuth || decoded.type !== 'competition_qr') {
                throw new Error('Token QR invalide');
            }

            // Vérifier que c'est bien le jour de la compétition
            const today = new Date().toISOString().split('T')[0];
            if (decoded.competitionDate !== today) {
                throw new Error('Ce QR Code n\'est valide que le jour de la compétition');
            }

            // Vérifier que la compétition existe toujours
            const competition = await CompetitionService.getCompetitionById(decoded.competitionId);

            // Vérifier que le juge existe et est toujours assigné
            const judgesInCompetition = await JugeService.getJugesByCompetition(decoded.competitionId);
            const assignedJudge = judgesInCompetition.find(j => j.idjuge === decoded.judgeId);
            
            if (!assignedJudge) {
                throw new Error('Ce juge n\'est plus assigné à cette compétition');
            }

            // Récupérer les informations complètes de l'utilisateur
            const userQuery = `
                SELECT u.idutilisateur, u.nomutilisateur, u.prenomutilisateur, 
                       u.username, u.idjuge, u.idrole 
                FROM utilisateur u 
                WHERE u.idjuge = $1 AND u.idrole = 3
            `;
            const userResult = await pool.query(userQuery, [decoded.judgeId]);
            
            if (userResult.rows.length === 0) {
                throw new Error('Compte utilisateur du juge non trouvé');
            }

            const user = userResult.rows[0];

            // Générer un token JWT permanent pour la session
            const permanentTokenPayload = {
                userId: user.idutilisateur,
                judgeId: user.idjuge,
                role: user.idrole,
                competitionId: decoded.competitionId,
                authenticatedViaQR: true,
                iat: Math.floor(Date.now() / 1000)
            };

            const permanentToken = jwt.sign(
                permanentTokenPayload, 
                config.jwt.secret as string, 
                { expiresIn: config.jwt.expiresIn }
            );

            return {
                success: true,
                data: {
                    permanentToken,
                    user: {
                        idutilisateur: user.idutilisateur,
                        nomutilisateur: user.nomutilisateur,
                        prenomutilisateur: user.prenomutilisateur,
                        username: user.username,
                        idjuge: user.idjuge,
                        idrole: user.idrole
                    },
                    competition: {
                        idcompetition: competition.idcompetition,
                        datecompetition: competition.datecompetition
                    },
                    message: `Authentification réussie pour la compétition du ${competition.datecompetition.toISOString().split('T')[0]}`
                }
            };

        } catch (error) {
            console.error('Erreur lors de la validation du QR Code:', error);
            
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('QR Code invalide ou corrompu');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('QR Code expiré');
            }
            
            throw error;
        }
    }

    static async generateBulkQRCodes(competitionId: number): Promise<GenerateQRResponse[]> {
        try {
            // Récupérer tous les juges assignés à cette compétition qui peuvent avoir un QR
            const eligibleJudges = await JugeService.getJugesForQRGeneration(competitionId);
            
            const qrCodes: GenerateQRResponse[] = [];
            
            for (const judge of eligibleJudges) {
                if (judge.canGenerateQR) {
                    try {
                        const qrResponse = await this.generateQRCodeForJudge({
                            competitionId,
                            judgeId: judge.idjuge
                        });
                        qrCodes.push(qrResponse);
                    } catch (error) {
                        console.warn(`Impossible de générer QR pour juge ${judge.idjuge}:`, error);
                        // Continue avec les autres juges
                    }
                }
            }

            return qrCodes;
        } catch (error) {
            console.error('Erreur lors de la génération en masse des QR Codes:', error);
            throw error;
        }
    }

    static async getCompetitionQRStatus(competitionId: number) {
        try {
            const competition = await CompetitionService.getCompetitionById(competitionId);
            const eligibleJudges = await JugeService.getJugesForQRGeneration(competitionId);
            
            const competitionDate = new Date(competition.datecompetition);
            const today = new Date();
            const isCompetitionDay = competitionDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            
            return {
                competition: {
                    idcompetition: competition.idcompetition,
                    datecompetition: competition.datecompetition,
                    isToday: isCompetitionDay
                },
                judges: eligibleJudges.map(judge => ({
                    ...judge,
                    qrGenerationStatus: judge.canGenerateQR ? 'ready' : 'no_user_account'
                })),
                summary: {
                    totalJudges: eligibleJudges.length,
                    eligibleForQR: eligibleJudges.filter(j => j.canGenerateQR).length,
                    canGenerateQR: isCompetitionDay || competitionDate > today
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération du statut QR:', error);
            throw error;
        }
    }
}