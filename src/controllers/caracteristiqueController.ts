import { Request, Response } from 'express';
import { CaracteristiqueService } from '../services/caracteristiqueService';

export class CaracteristiqueController {

    static async getAllCaracteristiques(req: Request, res: Response): Promise<void> {
        try {
            const caracteristiques = await CaracteristiqueService.getAllCaracteristiques();
            res.json({
                success: true,
                data: caracteristiques,
                message: 'Caractéristiques récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des caractéristiques:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des caractéristiques'
            });
        }
    }

    static async getCaracteristiqueById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const caracteristique = await CaracteristiqueService.getCaracteristiqueById(id);
            res.json({
                success: true,
                data: caracteristique,
                message: 'Caractéristique récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la caractéristique:', error);
            if (error instanceof Error && error.message === 'Caractéristique non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la caractéristique'
                });
            }
        }
    }

    static async getCaracteristiquesByEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            const caracteristiques = await CaracteristiqueService.getCaracteristiquesByEpreuve(epreuveId);
            res.json({
                success: true,
                data: caracteristiques,
                message: 'Caractéristiques de l\'épreuve récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des caractéristiques par épreuve:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des caractéristiques par épreuve'
            });
        }
    }

    static async createCaracteristique(req: Request, res: Response): Promise<void> {
        try {
            const nouvelleCaracteristique = await CaracteristiqueService.createCaracteristique(req.body);
            res.status(201).json({
                success: true,
                data: nouvelleCaracteristique,
                message: 'Caractéristique créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de la caractéristique:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création de la caractéristique'
            });
        }
    }

    static async updateCaracteristique(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const caracteristiqueModifiee = await CaracteristiqueService.updateCaracteristique(id, req.body);
            res.json({
                success: true,
                data: caracteristiqueModifiee,
                message: 'Caractéristique mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la caractéristique:', error);
            if (error instanceof Error && error.message === 'Caractéristique non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la caractéristique'
                });
            }
        }
    }

    static async deleteCaracteristique(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await CaracteristiqueService.deleteCaracteristique(id);
            res.json({
                success: true,
                message: 'Caractéristique supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la caractéristique:', error);
            if (error instanceof Error && error.message === 'Caractéristique non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de la caractéristique'
                });
            }
        }
    }

    static async assignCaracteristiqueToEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const { caracteristiqueId } = req.body;

            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            if (!caracteristiqueId || isNaN(parseInt(caracteristiqueId))) {
                res.status(400).json({
                    success: false,
                    message: 'ID caractéristique requis et doit être un nombre'
                });
                return;
            }

            await CaracteristiqueService.assignCaracteristiqueToEpreuve(epreuveId, parseInt(caracteristiqueId));
            res.json({
                success: true,
                message: 'Caractéristique assignée à l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation de la caractéristique à l\'épreuve:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de l\'assignation de la caractéristique à l\'épreuve'
            });
        }
    }

    static async removeCaracteristiqueFromEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const caracteristiqueId = parseInt(req.params.caracteristiqueId);

            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            if (isNaN(caracteristiqueId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID caractéristique invalide'
                });
                return;
            }

            await CaracteristiqueService.removeCaracteristiqueFromEpreuve(epreuveId, caracteristiqueId);
            res.json({
                success: true,
                message: 'Caractéristique retirée de l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'association épreuve-caractéristique:', error);
            if (error instanceof Error && error.message === 'Association épreuve-caractéristique non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de l\'association épreuve-caractéristique'
                });
            }
        }
    }
}