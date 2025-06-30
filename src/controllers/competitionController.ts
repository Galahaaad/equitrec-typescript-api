import { Request, Response } from 'express';
import { CompetitionService } from '../services/competitionService';

export class CompetitionController {

    static async getAllCompetitions(req: Request, res: Response): Promise<void> {
        try {
            const competitions = await CompetitionService.getAllCompetitions();
            res.json({
                success: true,
                data: competitions,
                message: 'Compétitions récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des compétitions:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des compétitions'
            });
        }
    }

    static async getCompetitionById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const competition = await CompetitionService.getCompetitionById(id);
            res.json({
                success: true,
                data: competition,
                message: 'Compétition récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétition:', error);
            if (error instanceof Error && error.message === 'Compétition non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la compétition'
                });
            }
        }
    }

    static async getCompetitionWithJudges(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const competition = await CompetitionService.getCompetitionWithJudges(id);
            res.json({
                success: true,
                data: competition,
                message: 'Compétition avec juges récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétition avec juges:', error);
            if (error instanceof Error && error.message === 'Compétition non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la compétition avec juges'
                });
            }
        }
    }

    static async getUpcomingCompetitions(req: Request, res: Response): Promise<void> {
        try {
            const competitions = await CompetitionService.getUpcomingCompetitions();
            res.json({
                success: true,
                data: competitions,
                message: 'Compétitions à venir récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des compétitions à venir:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des compétitions à venir'
            });
        }
    }

    static async getCompetitionsByDate(req: Request, res: Response): Promise<void> {
        try {
            const { date } = req.params;
            if (!date) {
                res.status(400).json({
                    success: false,
                    message: 'Date requise'
                });
                return;
            }

            const competitions = await CompetitionService.getCompetitionsByDate(date);
            res.json({
                success: true,
                data: competitions,
                message: `Compétitions du ${date} récupérées avec succès`
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des compétitions par date:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des compétitions par date'
            });
        }
    }

    static async createCompetition(req: Request, res: Response): Promise<void> {
        try {
            const nouvelleCompetition = await CompetitionService.createCompetition(req.body);
            res.status(201).json({
                success: true,
                data: nouvelleCompetition,
                message: 'Compétition créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de la compétition:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création de la compétition'
            });
        }
    }

    static async updateCompetition(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const competitionModifiee = await CompetitionService.updateCompetition(id, req.body);
            res.json({
                success: true,
                data: competitionModifiee,
                message: 'Compétition mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la compétition:', error);
            if (error instanceof Error && error.message === 'Compétition non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la compétition'
                });
            }
        }
    }

    static async deleteCompetition(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await CompetitionService.deleteCompetition(id);
            res.json({
                success: true,
                message: 'Compétition supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la compétition:', error);
            if (error instanceof Error && error.message === 'Compétition non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de la compétition'
                });
            }
        }
    }

    static async assignJudgeToCompetition(req: Request, res: Response): Promise<void> {
        try {
            const competitionId = parseInt(req.params.id);
            if (isNaN(competitionId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de compétition invalide'
                });
                return;
            }

            const { judgeId } = req.body;
            if (!judgeId || isNaN(parseInt(judgeId))) {
                res.status(400).json({
                    success: false,
                    message: 'ID de juge requis et valide'
                });
                return;
            }

            await CompetitionService.assignJudgeToCompetition(competitionId, parseInt(judgeId));
            res.json({
                success: true,
                message: 'Juge assigné à la compétition avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation du juge:', error);
            if (error instanceof Error && (
                error.message === 'Compétition non trouvée' ||
                error.message === 'Le juge spécifié n\'existe pas' ||
                error.message === 'Ce juge est déjà assigné à cette compétition'
            )) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'assignation du juge'
                });
            }
        }
    }

    static async removeJudgeFromCompetition(req: Request, res: Response): Promise<void> {
        try {
            const competitionId = parseInt(req.params.competitionId);
            const judgeId = parseInt(req.params.judgeId);

            if (isNaN(competitionId) || isNaN(judgeId)) {
                res.status(400).json({
                    success: false,
                    message: 'IDs de compétition et juge requis et valides'
                });
                return;
            }

            await CompetitionService.removeJudgeFromCompetition(competitionId, judgeId);
            res.json({
                success: true,
                message: 'Juge retiré de la compétition avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du retrait du juge:', error);
            if (error instanceof Error && error.message === 'Assignation non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors du retrait du juge'
                });
            }
        }
    }
}