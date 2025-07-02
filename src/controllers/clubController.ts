import { Request, Response } from 'express';
import { ClubService } from '../services/clubService';
import { AuthenticatedRequest } from '../types';

export class ClubController {
    static async getAllClubs(req: Request, res: Response): Promise<void> {
        try {
            const clubs = await ClubService.getAllClubs();

            res.status(200).json({
                success: true,
                data: clubs,
                message: 'Clubs récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur dans getAllClubs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des clubs'
            });
        }
    }

    static async getClubById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const clubId = parseInt(id);

            if (isNaN(clubId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du club invalide'
                });
                return;
            }

            const club = await ClubService.getClubById(clubId);

            res.status(200).json({
                success: true,
                data: club,
                message: 'Club récupéré avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans getClubById:', error);

            if (error.message === 'Club non trouvé') {
                res.status(404).json({
                    success: false,
                    message: 'Club non trouvé'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du club'
            });
        }
    }

    static async createClub(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { nomclub } = req.body;

            if (!nomclub) {
                res.status(400).json({
                    success: false,
                    message: 'Le nom du club est requis'
                });
                return;
            }

            const newClub = await ClubService.createClub({ nomclub });

            res.status(201).json({
                success: true,
                data: newClub,
                message: 'Club créé avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans createClub:', error);

            if (error.message === 'Un club avec ce nom existe déjà') {
                res.status(409).json({
                    success: false,
                    message: 'Un club avec ce nom existe déjà'
                });
                return;
            }

            if (error.message === 'Le nom du club est requis' ||
                error.message === 'Le nom du club ne peut pas dépasser 100 caractères') {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du club'
            });
        }
    }

    static async deleteClub(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const clubId = parseInt(id);

            if (isNaN(clubId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID du club invalide'
                });
                return;
            }

            await ClubService.deleteClub(clubId);

            res.status(200).json({
                success: true,
                message: 'Club supprimé avec succès'
            });
        } catch (error: any) {
            console.error('Erreur dans deleteClub:', error);

            if (error.message === 'Club non trouvé') {
                res.status(404).json({
                    success: false,
                    message: 'Club non trouvé'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du club'
            });
        }
    }
}
