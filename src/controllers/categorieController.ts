import { Request, Response } from 'express';
import { CategorieService } from '../services/categorieService';

export class CategorieController {

    static async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await CategorieService.getAllCategories();
            res.json({
                success: true,
                data: categories,
                message: 'Catégories récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des catégories'
            });
        }
    }

    static async getCategorieById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const categorie = await CategorieService.getCategorieById(id);
            res.json({
                success: true,
                data: categorie,
                message: 'Catégorie récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie:', error);
            if (error instanceof Error && error.message === 'Catégorie non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la catégorie'
                });
            }
        }
    }

    static async createCategorie(req: Request, res: Response): Promise<void> {
        try {
            const nouvelleCategorie = await CategorieService.createCategorie(req.body);
            res.status(201).json({
                success: true,
                data: nouvelleCategorie,
                message: 'Catégorie créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de la catégorie:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création de la catégorie'
            });
        }
    }

    static async updateCategorie(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const categorieModifiee = await CategorieService.updateCategorie(id, req.body);
            res.json({
                success: true,
                data: categorieModifiee,
                message: 'Catégorie mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la catégorie:', error);
            if (error instanceof Error && error.message === 'Catégorie non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la catégorie'
                });
            }
        }
    }

    static async deleteCategorie(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await CategorieService.deleteCategorie(id);
            res.json({
                success: true,
                message: 'Catégorie supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la catégorie:', error);
            if (error instanceof Error && error.message === 'Catégorie non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de la catégorie'
                });
            }
        }
    }

    // Méthodes pour la gestion des fiches de notation
    static async getCategorieWithFiches(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const categorieWithFiches = await CategorieService.getCategorieWithFiches(id);
            res.json({
                success: true,
                data: categorieWithFiches,
                message: 'Catégorie avec fiches récupérée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie avec fiches:', error);
            if (error instanceof Error && error.message === 'Catégorie non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la catégorie avec fiches'
                });
            }
        }
    }

    static async getFichesByCategorie(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const fiches = await CategorieService.getFichesByCategorie(id);
            res.json({
                success: true,
                data: fiches,
                message: 'Fiches de notation de la catégorie récupérées avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches par catégorie:', error);
            if (error instanceof Error && error.message === 'Catégorie non trouvée') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des fiches'
                });
            }
        }
    }

    static async assignFicheToCategorie(req: Request, res: Response): Promise<void> {
        try {
            const categorieId = parseInt(req.params.id);
            if (isNaN(categorieId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de catégorie invalide'
                });
                return;
            }

            const { idfichenotation } = req.body;
            if (!idfichenotation || isNaN(parseInt(idfichenotation))) {
                res.status(400).json({
                    success: false,
                    message: 'ID de fiche de notation requis et valide'
                });
                return;
            }

            await CategorieService.assignFicheToCategorie(categorieId, parseInt(idfichenotation));
            res.json({
                success: true,
                message: 'Fiche de notation assignée à la catégorie avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation de la fiche:', error);
            if (error instanceof Error && (
                error.message === 'Catégorie non trouvée' ||
                error.message === 'La fiche de notation spécifiée n\'existe pas' ||
                error.message === 'Cette fiche de notation est déjà assignée à cette catégorie'
            )) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'assignation de la fiche'
                });
            }
        }
    }
}