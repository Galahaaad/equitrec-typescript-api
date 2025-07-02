import { Request, Response } from 'express';
import { NiveauService } from '../services/niveauService';

export class NiveauController {

    static async getAllNiveaux(req: Request, res: Response): Promise<void> {
        try {
            const niveaux = await NiveauService.getAllNiveaux();
            res.json({
                success: true,
                data: niveaux,
                message: 'Niveaux récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des niveaux:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des niveaux'
            });
        }
    }

    static async getNiveauById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const niveau = await NiveauService.getNiveauById(id);
            res.json({
                success: true,
                data: niveau,
                message: 'Niveau récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du niveau:', error);
            if (error instanceof Error && error.message === 'Niveau non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération du niveau'
                });
            }
        }
    }

    static async createNiveau(req: Request, res: Response): Promise<void> {
        try {
            const nouveauNiveau = await NiveauService.createNiveau(req.body);
            res.status(201).json({
                success: true,
                data: nouveauNiveau,
                message: 'Niveau créé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création du niveau:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du niveau'
            });
        }
    }

    static async updateNiveau(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const niveauModifie = await NiveauService.updateNiveau(id, req.body);
            res.json({
                success: true,
                data: niveauModifie,
                message: 'Niveau mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du niveau:', error);
            if (error instanceof Error && error.message === 'Niveau non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du niveau'
                });
            }
        }
    }

    static async deleteNiveau(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await NiveauService.deleteNiveau(id);
            res.json({
                success: true,
                message: 'Niveau supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du niveau:', error);
            if (error instanceof Error && error.message === 'Niveau non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression du niveau'
                });
            }
        }
    }
}