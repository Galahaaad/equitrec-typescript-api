import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserModel } from '../models/User';
import { pool } from '../config/database';
import { AuthenticatedRequest } from '../types';

const userModel = new UserModel(pool);
const authService = new AuthService(userModel);

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nomutilisateur, prenomutilisateur, username, password, idjuge, idrole } = req.body;

        if (!nomutilisateur || !prenomutilisateur || !username || !password || !idrole) {
            res.status(400).json({
                success: false,
                message: 'Nom, prénom, nom d\'utilisateur, mot de passe et rôle requis'
            });
            return;
        }

        const result = await authService.register({
            nomutilisateur,
            prenomutilisateur,
            username,
            password,
            idjuge: idjuge || null,
            idrole
        });

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: result
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username et password requis'
            });
            return;
        }

        const result = await authService.login({ username, password });

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: result
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Erreur d\'authentification'
        });
    }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.user?.id || '0');

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Profil récupéré',
            data: userModel.toResponse(user)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};
