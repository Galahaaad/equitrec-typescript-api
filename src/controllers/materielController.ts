import { Request, Response } from 'express';
import { MaterielService } from '../services/materielService';

export class MaterielController {

    static async getAllMateriels(req: Request, res: Response): Promise<void> {
        try {
            const materiels = await MaterielService.getAllMateriels();
            res.json({
                success: true,
                data: materiels,
                message: 'Matériels récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des matériels:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des matériels'
            });
        }
    }

    static async getMaterielById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const materiel = await MaterielService.getMaterielById(id);
            res.json({
                success: true,
                data: materiel,
                message: 'Matériel récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du matériel:', error);
            if (error instanceof Error && error.message === 'Matériel non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération du matériel'
                });
            }
        }
    }

    static async getMaterielsByEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            const materiels = await MaterielService.getMaterielsByEpreuve(epreuveId);
            res.json({
                success: true,
                data: materiels,
                message: 'Matériels de l\'épreuve récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des matériels par épreuve:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des matériels par épreuve'
            });
        }
    }

    static async createMateriel(req: Request, res: Response): Promise<void> {
        try {
            const nouveauMateriel = await MaterielService.createMateriel(req.body);
            res.status(201).json({
                success: true,
                data: nouveauMateriel,
                message: 'Matériel créé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création du matériel:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du matériel'
            });
        }
    }

    static async updateMateriel(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const materielModifie = await MaterielService.updateMateriel(id, req.body);
            res.json({
                success: true,
                data: materielModifie,
                message: 'Matériel mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du matériel:', error);
            if (error instanceof Error && error.message === 'Matériel non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du matériel'
                });
            }
        }
    }

    static async deleteMateriel(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await MaterielService.deleteMateriel(id);
            res.json({
                success: true,
                message: 'Matériel supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du matériel:', error);
            if (error instanceof Error && error.message === 'Matériel non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression du matériel'
                });
            }
        }
    }

    static async assignMaterielToEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const { materielId, quantite } = req.body;

            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            if (!materielId || isNaN(parseInt(materielId))) {
                res.status(400).json({
                    success: false,
                    message: 'ID matériel requis et doit être un nombre'
                });
                return;
            }

            if (!quantite || isNaN(parseInt(quantite)) || parseInt(quantite) <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Quantité requise et doit être un nombre positif'
                });
                return;
            }

            await MaterielService.assignMaterielToEpreuve(epreuveId, parseInt(materielId), parseInt(quantite));
            res.json({
                success: true,
                message: 'Matériel assigné à l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation du matériel à l\'épreuve:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de l\'assignation du matériel à l\'épreuve'
            });
        }
    }

    static async updateMaterielQuantiteForEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const materielId = parseInt(req.params.materielId);
            const { quantite } = req.body;

            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            if (isNaN(materielId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID matériel invalide'
                });
                return;
            }

            if (!quantite || isNaN(parseInt(quantite)) || parseInt(quantite) <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Quantité requise et doit être un nombre positif'
                });
                return;
            }

            await MaterielService.updateMaterielQuantiteForEpreuve(epreuveId, materielId, parseInt(quantite));
            res.json({
                success: true,
                message: 'Quantité du matériel mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la quantité:', error);
            if (error instanceof Error && error.message === 'Association épreuve-matériel non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la quantité'
                });
            }
        }
    }

    static async removeMaterielFromEpreuve(req: Request, res: Response): Promise<void> {
        try {
            const epreuveId = parseInt(req.params.epreuveId);
            const materielId = parseInt(req.params.materielId);

            if (isNaN(epreuveId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID épreuve invalide'
                });
                return;
            }

            if (isNaN(materielId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID matériel invalide'
                });
                return;
            }

            await MaterielService.removeMaterielFromEpreuve(epreuveId, materielId);
            res.json({
                success: true,
                message: 'Matériel retiré de l\'épreuve avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'association épreuve-matériel:', error);
            if (error instanceof Error && error.message === 'Association épreuve-matériel non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de l\'association épreuve-matériel'
                });
            }
        }
    }
}