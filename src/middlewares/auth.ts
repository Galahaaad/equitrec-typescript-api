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
            email: user.email,
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

export const requireJudgeRole = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentification requise'
        });
        return;
    }

    if (req.user.role !== '3') {
        res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits de Juge requis.'
        });
        return;
    }

    next();
};


export const requireSuperAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentification requise'
        });
        return;
    }

    if (req.user.role !== '1') {
        res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits de Super Administrateur requis.'
        });
        return;
    }

    next();
};
