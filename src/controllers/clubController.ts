import { Request, Response } from 'express';
import { ClubService } from '../services/clubService';

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
}
