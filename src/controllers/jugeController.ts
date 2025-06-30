import { Request, Response } from 'express';
import { JugeService } from '../services/jugeService';

export class JugeController {

    static async getAllJuges(req: Request, res: Response): Promise<void> {
        try {
            const juges = await JugeService.getAllJuges();
            res.json({
                success: true,
                data: juges,
                message: 'Juges récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des juges:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des juges'
            });
        }
    }

    static async getJugeById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const juge = await JugeService.getJugeById(id);
            res.json({
                success: true,
                data: juge,
                message: 'Juge récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du juge:', error);
            if (error instanceof Error && error.message === 'Juge non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération du juge'
                });
            }
        }
    }

    static async getJugeWithCompetitions(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const juge = await JugeService.getJugeWithCompetitions(id);
            res.json({
                success: true,
                data: juge,
                message: 'Juge avec compétitions récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du juge avec compétitions:', error);
            if (error instanceof Error && error.message === 'Juge non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération du juge avec compétitions'
                });
            }
        }
    }

    static async createJuge(req: Request, res: Response): Promise<void> {
        try {
            const nouveauJuge = await JugeService.createJuge(req.body);
            res.status(201).json({
                success: true,
                data: nouveauJuge,
                message: 'Juge créé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création du juge:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du juge'
            });
        }
    }

    static async updateJuge(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const jugeModifie = await JugeService.updateJuge(id, req.body);
            res.json({
                success: true,
                data: jugeModifie,
                message: 'Juge mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du juge:', error);
            if (error instanceof Error && error.message === 'Juge non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du juge'
                });
            }
        }
    }

    static async deleteJuge(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await JugeService.deleteJuge(id);
            res.json({
                success: true,
                message: 'Juge supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du juge:', error);
            if (error instanceof Error && error.message === 'Juge non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression du juge'
                });
            }
        }
    }
}