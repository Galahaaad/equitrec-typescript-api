import { Request, Response } from 'express';
import { CritereService } from '../services/critereService';

export class CritereController {

    static async getAllCriteres(req: Request, res: Response): Promise<void> {
        try {
            const criteres = await CritereService.getAllCriteres();
            res.json({
                success: true,
                data: criteres,
                message: 'Critères récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des critères:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des critères'
            });
        }
    }

    static async getCritereById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const critere = await CritereService.getCritereById(id);
            res.json({
                success: true,
                data: critere,
                message: 'Critère récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du critère:', error);
            if (error instanceof Error && error.message === 'Critère non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération du critère'
                });
            }
        }
    }

    static async createCritere(req: Request, res: Response): Promise<void> {
        try {
            const nouveauCritere = await CritereService.createCritere(req.body);
            res.status(201).json({
                success: true,
                data: nouveauCritere,
                message: 'Critère créé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création du critère:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du critère'
            });
        }
    }

    static async updateCritere(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const critereModifie = await CritereService.updateCritere(id, req.body);
            res.json({
                success: true,
                data: critereModifie,
                message: 'Critère mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du critère:', error);
            if (error instanceof Error && error.message === 'Critère non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du critère'
                });
            }
        }
    }

    static async deleteCritere(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await CritereService.deleteCritere(id);
            res.json({
                success: true,
                message: 'Critère supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du critère:', error);
            if (error instanceof Error && error.message === 'Critère non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression du critère'
                });
            }
        }
    }
}