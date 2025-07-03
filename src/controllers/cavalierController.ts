import { Request, Response } from 'express';
import { CavalierService } from '../services/cavalierService';
import { ParticipationService } from '../services/participationService';
import { AuthenticatedRequest } from '../types';

export class CavalierController {
    static async getAllCavaliers(req: Request, res: Response): Promise<void> {
        try {
            const cavaliers = await CavalierService.getAllCavaliers();

            res.status(200).json({
                success: true,
                data: cavaliers,
                message: 'Cavaliers récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur dans getAllCavaliers:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des cavaliers'
            });
        }
    }

    static async getCavalierById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const cavalierId = parseInt(id);

            if (isNaN(cavalierId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier invalide'
                });
                return;
            }

            const cavalier = await CavalierService.getCavalierById(cavalierId);

            res.status(200).json({
                success: true,
                data: cavalier,
                message: 'Cavalier récupéré avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans getCavalierById:', error);

            if (error.message === 'Cavalier non trouvé') {
                res.status(404).json({
                    success: false,
                    message: 'Cavalier non trouvé'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du cavalier'
            });
        }
    }

    static async getCavaliersByClub(req: Request, res: Response): Promise<void> {
        try {
            const { clubId } = req.params;
            const clubIdNumber = parseInt(clubId);

            if (isNaN(clubIdNumber)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du club invalide'
                });
                return;
            }

            const cavaliers = await CavalierService.getCavaliersByClub(clubIdNumber);

            res.status(200).json({
                success: true,
                data: cavaliers,
                message: 'Cavaliers du club récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur dans getCavaliersByClub:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des cavaliers du club'
            });
        }
    }

    static async createCavalier(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { nomcavalier, prenomcavalier, datenaissance, numerodossard, idclub } = req.body;

            if (!nomcavalier || !prenomcavalier || !datenaissance || !numerodossard || !idclub) {
                res.status(400).json({
                    success: false,
                    message: 'Nom, prénom, date de naissance, numéro de dossard et club sont requis'
                });
                return;
            }

            const newCavalier = await CavalierService.createCavalier({
                nomcavalier,
                prenomcavalier,
                datenaissance,
                numerodossard,
                idclub
            });

            res.status(201).json({
                success: true,
                data: newCavalier,
                message: 'Cavalier créé avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans createCavalier:', error);

            if (error.message === 'Ce numéro de dossard est déjà utilisé' ||
                error.message === 'Le club spécifié n\'existe pas') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            if (error.message.includes('requis') || error.message.includes('caractères')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du cavalier'
            });
        }
    }

    static async updateCavalier(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const cavalierId = parseInt(id);

            if (isNaN(cavalierId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier invalide'
                });
                return;
            }

            const { nomcavalier, prenomcavalier, datenaissance, numerodossard, idclub } = req.body;

            const updatedCavalier = await CavalierService.updateCavalier(cavalierId, {
                nomcavalier,
                prenomcavalier,
                datenaissance,
                numerodossard,
                idclub
            });

            res.status(200).json({
                success: true,
                data: updatedCavalier,
                message: 'Cavalier mis à jour avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans updateCavalier:', error);

            if (error.message === 'Cavalier non trouvé') {
                res.status(404).json({
                    success: false,
                    message: 'Cavalier non trouvé'
                });
                return;
            }

            if (error.message === 'Ce numéro de dossard est déjà utilisé' ||
                error.message === 'Le club spécifié n\'existe pas') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            if (error.message.includes('vide') || error.message.includes('caractères') ||
                error.message === 'Aucune donnée à mettre à jour') {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du cavalier'
            });
        }
    }

    static async deleteCavalier(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const cavalierId = parseInt(id);

            if (isNaN(cavalierId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier invalide'
                });
                return;
            }

            await CavalierService.deleteCavalier(cavalierId);

            res.status(200).json({
                success: true,
                message: 'Cavalier supprimé avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans deleteCavalier:', error);

            if (error.message === 'Cavalier non trouvé') {
                res.status(404).json({
                    success: false,
                    message: 'Cavalier non trouvé'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du cavalier'
            });
        }
    }

    static async getParticipationsByCavalier(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const cavalierId = parseInt(id);

            if (isNaN(cavalierId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier invalide'
                });
                return;
            }

            const participations = await ParticipationService.getParticipationsByCavalier(cavalierId);

            res.status(200).json({
                success: true,
                data: participations,
                message: 'Participations du cavalier récupérées avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans getParticipationsByCavalier:', error);

            if (error.message === 'Cavalier non trouvé') {
                res.status(404).json({
                    success: false,
                    message: 'Cavalier non trouvé'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des participations'
            });
        }
    }

    static async inscrireCavalierCompetition(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { idcompetition, idniveau } = req.body;
            const { id } = req.params;
            const idcavalier = parseInt(id);

            if (isNaN(idcavalier)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier invalide'
                });
                return;
            }

            if (!idcompetition || !idniveau) {
                res.status(400).json({
                    success: false,
                    message: 'ID de compétition et ID de niveau sont requis'
                });
                return;
            }

            const participation = await ParticipationService.inscrireCavalierCompetition({
                idcavalier,
                idcompetition,
                idniveau
            });

            res.status(201).json({
                success: true,
                data: participation,
                message: 'Cavalier inscrit à la compétition avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans inscrireCavalierCompetition:', error);

            if (error.message === 'Cavalier non trouvé' ||
                error.message === 'Compétition non trouvée' ||
                error.message === 'Niveau non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            if (error.message === 'Ce cavalier est déjà inscrit à cette compétition') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'inscription du cavalier'
            });
        }
    }

    static async retirerParticipationCavalier(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id, competitionId } = req.params;
            const idcavalier = parseInt(id);
            const idcompetition = parseInt(competitionId);

            if (isNaN(idcavalier) || isNaN(idcompetition)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier ou de la compétition invalide'
                });
                return;
            }

            await ParticipationService.retirerParticipation(idcavalier, idcompetition);

            res.status(200).json({
                success: true,
                message: 'Participation retirée avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans retirerParticipationCavalier:', error);

            if (error.message === 'Participation non trouvée') {
                res.status(404).json({
                    success: false,
                    message: 'Participation non trouvée'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors du retrait de la participation'
            });
        }
    }

    static async changerNiveauParticipationCavalier(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id, competitionId } = req.params;
            const { idniveau } = req.body;
            const idcavalier = parseInt(id);
            const idcompetition = parseInt(competitionId);

            if (isNaN(idcavalier) || isNaN(idcompetition)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du cavalier ou de la compétition invalide'
                });
                return;
            }

            if (!idniveau) {
                res.status(400).json({
                    success: false,
                    message: 'ID du nouveau niveau requis'
                });
                return;
            }

            const participation = await ParticipationService.changerNiveauParticipation(
                idcavalier,
                idcompetition,
                idniveau
            );

            res.status(200).json({
                success: true,
                data: participation,
                message: 'Niveau de participation modifié avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans changerNiveauParticipationCavalier:', error);

            if (error.message === 'Participation non trouvée' ||
                error.message === 'Nouveau niveau non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors du changement de niveau'
            });
        }
    }
}
