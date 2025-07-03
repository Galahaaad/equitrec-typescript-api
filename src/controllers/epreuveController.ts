import { Request, Response } from 'express';
import { EpreuveService } from '../services/epreuveService';

export class EpreuveController {

    static async getAllEpreuves(req: Request, res: Response): Promise<void> {
        try {
            const epreuves = await EpreuveService.getAllEpreuves();
            res.json({
                success: true,
                data: epreuves,
                message: 'Épreuves récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des épreuves:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des épreuves'
            });
        }
    }

    static async getEpreuveById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const epreuve = await EpreuveService.getEpreuveById(id);
            res.json({
                success: true,
                data: epreuve,
                message: 'Épreuve récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'épreuve:', error);
            if (error instanceof Error && error.message === 'Épreuve non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de l\'épreuve'
                });
            }
        }
    }

    static async getEpreuvesByJuge(req: Request, res: Response): Promise<void> {
        try {
            const jugeId = parseInt(req.params.jugeId);
            if (isNaN(jugeId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID juge invalide'
                });
                return;
            }

            const epreuves = await EpreuveService.getEpreuvesByJuge(jugeId);
            res.json({
                success: true,
                data: epreuves,
                message: 'Épreuves du juge récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des épreuves par juge:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des épreuves par juge'
            });
        }
    }

    static async createEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const nouvelleEpreuve = await EpreuveService.createEpreuve(req.body);
            res.status(201).json({
                success: true,
                data: nouvelleEpreuve,
                message: 'Épreuve créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'épreuve:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création de l\'épreuve'
            });
        }
    }

    static async updateEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const epreuveModifiee = await EpreuveService.updateEpreuve(id, req.body);
            res.json({
                success: true,
                data: epreuveModifiee,
                message: 'Épreuve mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'épreuve:', error);
            if (error instanceof Error && error.message === 'Épreuve non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'épreuve'
                });
            }
        }
    }

    static async deleteEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await EpreuveService.deleteEpreuve(id);
            res.json({
                success: true,
                message: 'Épreuve supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'épreuve:', error);
            if (error instanceof Error && error.message === 'Épreuve non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de l\'épreuve'
                });
            }
        }
    }

    static async getEpreuveWithCompetitions(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const epreuve = await EpreuveService.getEpreuveWithCompetitions(id);
            res.json({
                success: true,
                data: epreuve,
                message: 'Épreuve avec compétitions récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'épreuve avec compétitions:', error);
            if (error instanceof Error && error.message === 'Épreuve non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de l\'épreuve avec compétitions'
                });
            }
        }
    }

    static async addCompetitionToEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.id);
            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID d\'épreuve invalide'
                });
                return;
            }

            const { competitionId } = req.body;
            if (!competitionId || isNaN(parseInt(competitionId))) {
                res.status(400).json({
                    success: false,
                    message: 'ID de compétition requis et valide'
                });
                return;
            }

            await EpreuveService.addCompetitionToEpreuve(epreuveId, parseInt(competitionId));
            res.json({
                success: true,
                message: 'Compétition assignée à l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation de la compétition:', error);
            if (error instanceof Error && (
                error.message === 'Épreuve non trouvée' ||
                error.message === 'La compétition spécifiée n\'existe pas' ||
                error.message === 'Cette épreuve est déjà assignée à cette compétition'
            )) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'assignation de la compétition'
                });
            }
        }
    }

    static async removeCompetitionFromEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const competitionId = parseInt(req.params.competitionId);

            if (isNaN(epreuveId) || isNaN(competitionId)) {
                res.status(400).json({
                    success: false,
                    message: 'IDs d\'épreuve et compétition requis et valides'
                });
                return;
            }

            await EpreuveService.removeCompetitionFromEpreuve(epreuveId, competitionId);
            res.json({
                success: true,
                message: 'Compétition retirée de l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du retrait de la compétition:', error);
            if (error instanceof Error && error.message === 'Assignation non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors du retrait de la compétition'
                });
            }
        }
    }

    // Méthodes pour la gestion des critères
    static async getEpreuveWithCriteres(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const epreuveWithCriteres = await EpreuveService.getEpreuveWithCriteres(id);
            res.json({
                success: true,
                data: epreuveWithCriteres,
                message: 'Épreuve avec critères récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'épreuve avec critères:', error);
            if (error instanceof Error && error.message === 'Épreuve non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de l\'épreuve avec critères'
                });
            }
        }
    }

    static async assignCritereToEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.id);
            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID d\'épreuve invalide'
                });
                return;
            }

            const { idcritere } = req.body;
            if (!idcritere || isNaN(parseInt(idcritere))) {
                res.status(400).json({
                    success: false,
                    message: 'ID de critère requis et valide'
                });
                return;
            }

            await EpreuveService.assignCritereToEpreuve(epreuveId, parseInt(idcritere));
            res.json({
                success: true,
                message: 'Critère assigné à l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation du critère:', error);
            if (error instanceof Error && (
                error.message === 'Épreuve non trouvée' ||
                error.message === 'Le critère spécifié n\'existe pas' ||
                error.message === 'Ce critère est déjà assigné à cette épreuve'
            )) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'assignation du critère'
                });
            }
        }
    }

    static async removeCritereFromEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const critereId = parseInt(req.params.critereId);

            if (isNaN(epreuveId) || isNaN(critereId)) {
                res.status(400).json({
                    success: false,
                    message: 'IDs d\'épreuve et critère requis et valides'
                });
                return;
            }

            await EpreuveService.removeCritereFromEpreuve(epreuveId, critereId);
            res.json({
                success: true,
                message: 'Critère retiré de l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du retrait du critère:', error);
            if (error instanceof Error && error.message === 'Association critère-épreuve non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors du retrait du critère'
                });
            }
        }
    }
}