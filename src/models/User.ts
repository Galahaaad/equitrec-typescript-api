import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export interface User {
    idutilisateur: number;
    nomutilisateur: string;
    prenomutilisateur: string;
    username: string;
    password: string;
    idjuge: number | null;
    idrole: number;
}

export interface UserResponse {
    idutilisateur: number;
    nomutilisateur: string;
    prenomutilisateur: string;
    username: string;
    idjuge: number | null;
    idrole: number;
}

export interface CreateUserData {
    nomutilisateur: string;
    prenomutilisateur: string;
    username: string;
    password: string;
    idjuge?: number | null;
    idrole: number;
}

export class UserModel {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findByUsername(username: string): Promise<User | null> {
        const query = `
      SELECT idutilisateur, nomutilisateur, prenomutilisateur, 
             username, password, idjuge, idrole 
      FROM utilisateur 
      WHERE username = $1
    `;

        const result = await this.pool.query(query, [username]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findById(id: number): Promise<User | null> {
        const query = `
      SELECT idutilisateur, nomutilisateur, prenomutilisateur, 
             username, password, idjuge, idrole 
      FROM utilisateur 
      WHERE idutilisateur = $1
    `;

        const result = await this.pool.query(query, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async create(userData: CreateUserData): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const query = `
            INSERT INTO utilisateur (nomutilisateur, prenomutilisateur, username, password, idjuge, idrole)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING idutilisateur, nomutilisateur, prenomutilisateur, username, password, idjuge, idrole
        `;

        const values = [
            userData.nomutilisateur,
            userData.prenomutilisateur,
            userData.username,
            hashedPassword,
            userData.idjuge || null,
            userData.idrole
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    toResponse(user: User): UserResponse {
        const { password, ...userResponse } = user;
        return userResponse;
    }
}
