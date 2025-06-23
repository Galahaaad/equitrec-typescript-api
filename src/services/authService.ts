import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User, UserResponse } from '../models/User';
import config from '../config';

export interface LoginData {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: UserResponse;
    token: string;
}

export class AuthService {
    private userModel: UserModel;

    constructor(userModel: UserModel) {
        this.userModel = userModel;
    }

    async login(loginData: LoginData): Promise<LoginResponse> {
        const { username, password } = loginData;

        const user = await this.userModel.findByUsername(username);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Mot de passe incorrect');
        }

        const token = jwt.sign(
            {
                userId: user.idutilisateur,
                username: user.username,
                role: user.idrole
            },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        return {
            user: this.userModel.toResponse(user),
            token
        };
    }

    verifyToken(token: string) {
        try {
            return jwt.verify(token, config.jwt.secret);
        } catch (error) {
            throw new Error('Token invalide');
        }
    }
}
