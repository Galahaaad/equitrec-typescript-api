import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserModel } from '../models/User';
import { pool } from '../config/database';
import { AuthenticatedRequest } from '../types';

const userModel = new UserModel(pool);
const authService = new AuthService(userModel);

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token d\'accès requis'
            });
            return;
        }

        const decoded = authService.verifyToken(token) as any;

        const user = await userModel.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
            return;
        }

        req.user = {
            id: user.idutilisateur.toString(),
            email: user.username,
            role: user.idrole.toString()
        };

        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Token invalide'
        });
    }
};
