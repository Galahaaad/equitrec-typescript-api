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

    static async getEpreuvesByFicheNotation(req: Request, res: Response): Promise<void> {
        try {
            const ficheNotationId = parseInt(req.params.ficheNotationId);
            if (isNaN(ficheNotationId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID fiche de notation invalide'
                });
                return;
            }

            const epreuves = await EpreuveService.getEpreuvesByFicheNotation(ficheNotationId);
            res.json({
                success: true,
                data: epreuves,
                message: 'Épreuves de la fiche de notation récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des épreuves par fiche de notation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des épreuves par fiche de notation'
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
}