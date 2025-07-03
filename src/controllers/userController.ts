import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {

    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsers();
            res.json({
                success: true,
                data: users,
                message: 'Utilisateurs récupérés avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des utilisateurs'
            });
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const user = await UserService.getUserById(id);
            res.json({
                success: true,
                data: user,
                message: 'Utilisateur récupéré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            if (error instanceof Error && error.message === 'Utilisateur non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de l\'utilisateur'
                });
            }
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const updatedUser = await UserService.updateUser(id, req.body);
            res.json({
                success: true,
                data: updatedUser,
                message: 'Utilisateur mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            if (error instanceof Error && error.message === 'Utilisateur non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof Error && (
                error.message.includes('nom d\'utilisateur') ||
                error.message.includes('adresse email') ||
                error.message.includes('juge spécifié') ||
                error.message.includes('rôle spécifié') ||
                error.message.includes('nom doit contenir') ||
                error.message.includes('prénom doit contenir') ||
                error.message.includes('Format d\'email') ||
                error.message.includes('Aucune donnée')
            )) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la mise à jour de l\'utilisateur'
                });
            }
        }
    }

    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await UserService.deleteUser(id);
            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            if (error instanceof Error && error.message === 'Utilisateur non trouvé') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de l\'utilisateur'
                });
            }
        }
    }
}