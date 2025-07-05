import { pool } from '../config/database';
import { User, UserResponse, CreateUserData, UpdateUserRequest } from '../models/User';

export class UserService {

    static async getAllUsers(): Promise<UserResponse[]> {
        try {
            const query = `
                SELECT u.idutilisateur, u.nomutilisateur, u.prenomutilisateur, 
                       u.email, u.username, u.idjuge, u.idrole,
                       j.nomjuge, j.prenomjuge, j.codepin,
                       r.libelle as nomrole
                FROM utilisateur u
                LEFT JOIN juge j ON u.idjuge = j.idjuge
                LEFT JOIN role r ON u.idrole = r.idrole
                ORDER BY u.nomutilisateur ASC, u.prenomutilisateur ASC
            `;
            const result = await pool.query(query);
            
            return result.rows.map(user => {
                const { password, ...userResponse } = user;
                return userResponse;
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }
    }

    static async getUserById(id: number): Promise<UserResponse> {
        try {
            const query = `
                SELECT u.idutilisateur, u.nomutilisateur, u.prenomutilisateur, 
                       u.email, u.username, u.idjuge, u.idrole,
                       j.nomjuge, j.prenomjuge, j.codepin,
                       r.libelle as nomrole
                FROM utilisateur u
                LEFT JOIN juge j ON u.idjuge = j.idjuge
                LEFT JOIN role r ON u.idrole = r.idrole
                WHERE u.idutilisateur = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Utilisateur non trouvé');
            }

            const { password, ...userResponse } = result.rows[0];
            return userResponse;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            throw error;
        }
    }

    static async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
        try {
            const existingUser = await this.getUserById(id);

            if (userData.username && userData.username !== existingUser.username) {
                const usernameQuery = 'SELECT idutilisateur FROM utilisateur WHERE username = $1 AND idutilisateur != $2';
                const usernameResult = await pool.query(usernameQuery, [userData.username, id]);
                
                if (usernameResult.rows.length > 0) {
                    throw new Error('Ce nom d\'utilisateur est déjà utilisé');
                }
            }

            if (userData.email && userData.email !== existingUser.email) {
                const emailQuery = 'SELECT idutilisateur FROM utilisateur WHERE email = $1 AND idutilisateur != $2';
                const emailResult = await pool.query(emailQuery, [userData.email, id]);
                
                if (emailResult.rows.length > 0) {
                    throw new Error('Cette adresse email est déjà utilisée');
                }
            }

            if (userData.idjuge !== undefined && userData.idjuge !== null) {
                const judgeQuery = 'SELECT idjuge FROM juge WHERE idjuge = $1';
                const judgeResult = await pool.query(judgeQuery, [userData.idjuge]);
                
                if (judgeResult.rows.length === 0) {
                    throw new Error('Le juge spécifié n\'existe pas');
                }
            }

            if (userData.idrole !== undefined) {
                const roleQuery = 'SELECT idrole FROM role WHERE idrole = $1';
                const roleResult = await pool.query(roleQuery, [userData.idrole]);
                
                if (roleResult.rows.length === 0) {
                    throw new Error('Le rôle spécifié n\'existe pas');
                }
            }

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (userData.nomutilisateur !== undefined) {
                const nomTrimmed = userData.nomutilisateur.trim();
                if (nomTrimmed.length === 0 || nomTrimmed.length > 50) {
                    throw new Error('Le nom doit contenir entre 1 et 50 caractères');
                }
                updateFields.push(`nomutilisateur = $${paramIndex}`);
                values.push(nomTrimmed);
                paramIndex++;
            }

            if (userData.prenomutilisateur !== undefined) {
                const prenomTrimmed = userData.prenomutilisateur.trim();
                if (prenomTrimmed.length === 0 || prenomTrimmed.length > 50) {
                    throw new Error('Le prénom doit contenir entre 1 et 50 caractères');
                }
                updateFields.push(`prenomutilisateur = $${paramIndex}`);
                values.push(prenomTrimmed);
                paramIndex++;
            }

            if (userData.email !== undefined) {
                const emailTrimmed = userData.email.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailTrimmed)) {
                    throw new Error('Format d\'email invalide');
                }
                updateFields.push(`email = $${paramIndex}`);
                values.push(emailTrimmed);
                paramIndex++;
            }

            if (userData.username !== undefined) {
                const usernameTrimmed = userData.username.trim();
                if (usernameTrimmed.length < 3 || usernameTrimmed.length > 50) {
                    throw new Error('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
                }
                updateFields.push(`username = $${paramIndex}`);
                values.push(usernameTrimmed);
                paramIndex++;
            }

            if (userData.idjuge !== undefined) {
                updateFields.push(`idjuge = $${paramIndex}`);
                values.push(userData.idjuge);
                paramIndex++;
            }

            if (userData.idrole !== undefined) {
                updateFields.push(`idrole = $${paramIndex}`);
                values.push(userData.idrole);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const updateQuery = `
                UPDATE utilisateur 
                SET ${updateFields.join(', ')}
                WHERE idutilisateur = $${paramIndex}
                RETURNING idutilisateur, nomutilisateur, prenomutilisateur, email, username, idjuge, idrole
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Utilisateur non trouvé');
            }

            return await this.getUserById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw error;
        }
    }

    static async deleteUser(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.getUserById(id);

            const deleteQuery = 'DELETE FROM utilisateur WHERE idutilisateur = $1';
            await client.query(deleteQuery, [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}