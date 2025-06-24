import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User, UserResponse, CreateUserData } from '../models/User';
import config from '../config';

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData {
    nomutilisateur: string;
    prenomutilisateur: string;
    username: string;
    password: string;
    idjuge?: number | null;
    idrole: number;
}

export interface LoginResponse {
    user: UserResponse;
    token: string;
}

export interface RegisterResponse {
    user: UserResponse;
    token: string;
}

export class AuthService {
    private userModel: UserModel;

    constructor(userModel: UserModel) {
        this.userModel = userModel;
    }

    async register(registerData: RegisterData): Promise<RegisterResponse> {
        const existingUser = await this.userModel.findByUsername(registerData.username);
        if (existingUser) {
            throw new Error('Un utilisateur avec ce nom d\'utilisateur existe déjà');
        }

        const user = await this.userModel.create(registerData);

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
