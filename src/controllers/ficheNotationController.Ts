import { Request, Response } from 'express';
import { FicheNotationService } from '../services/ficheNotationService';

export class FicheNotationController {

    static async getAllFichesNotation(req: Request, res: Response): Promise<void> {
        try {
            const fiches = await FicheNotationService.getAllFichesNotation();
            res.json({
                success: true,
                data: fiches,
                message: 'Fiches de notation récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des fiches de notation'
            });
        }
    }

    static async getFicheNotationById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const fiche = await FicheNotationService.getFicheNotationById(id);
            res.json({
                success: true,
                data: fiche,
                message: 'Fiche de notation récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la fiche de notation:', error);
            if (error instanceof Error && error.message === 'Fiche de notation non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la fiche de notation'
                });
            }
        }
    }

    static async getFichesNotationByCavalier(req: Request, res: Response): Promise<void> {
        try {
            const cavalierId = parseInt(req.params.cavalierId);
            if (isNaN(cavalierId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID cavalier invalide'
                });
                return;
            }

            const fiches = await FicheNotationService.getFichesNotationByCavalier(cavalierId);
            res.json({
                success: true,
                data: fiches,
                message: 'Fiches de notation du cavalier récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation du cavalier:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des fiches de notation du cavalier'
            });
        }
    }

    static async getFichesNotationByEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            const fiches = await FicheNotationService.getFichesNotationByEpreuve(epreuveId);
            res.json({
                success: true,
                data: fiches,
                message: 'Fiches de notation de l\'épreuve récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation de l\'épreuve:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des fiches de notation de l\'épreuve'
            });
        }
    }

    static async createFicheNotation(req: Request, res: Response): Promise<void> {
        try {
            const nouvelleFiche = await FicheNotationService.createFicheNotation(req.body);
            res.status(201).json({
                success: true,
                data: nouvelleFiche,
                message: 'Fiche de notation créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de la fiche de notation:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création de la fiche de notation'
            });
        }
    }

    static async updateFicheNotation(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const ficheModifiee = await FicheNotationService.updateFicheNotation(id, req.body);
            res.json({
                success: true,
                data: ficheModifiee,
                message: 'Fiche de notation mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la fiche de notation:', error);
            if (error instanceof Error && error.message === 'Fiche de notation non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la fiche de notation'
                });
            }
        }
    }

    static async deleteFicheNotation(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await FicheNotationService.deleteFicheNotation(id);
            res.json({
                success: true,
                message: 'Fiche de notation supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la fiche de notation:', error);
            if (error instanceof Error && error.message === 'Fiche de notation non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de la fiche de notation'
                });
            }
        }
    }
}
