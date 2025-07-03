import { pool } from '../config/database';
import { Juge, CreateJugeRequest, UpdateJugeRequest, CreateJugeResponse, JugeWithCompetitions, CompetitionAssignment, JugeForQR } from '../models/Juge';

export class JugeService {

    static async getAllJuges(): Promise<Juge[]> {
        try {
            const query = `
                SELECT idjuge, nomjuge, prenomjuge
                FROM juge
                ORDER BY nomjuge, prenomjuge
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des juges:', error);
            throw new Error('Erreur lors de la récupération des juges');
        }
    }

    static async getJugeById(id: number): Promise<Juge> {
        try {
            const query = `
                SELECT idjuge, nomjuge, prenomjuge
                FROM juge
                WHERE idjuge = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Juge non trouvé');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du juge:', error);
            throw error;
        }
    }

    static async getJugeWithCompetitions(id: number): Promise<JugeWithCompetitions> {
        try {
            const juge = await this.getJugeById(id);
            
            const competitionsQuery = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition,
                       u.nomutilisateur, u.prenomutilisateur
                FROM juger jg
                JOIN competition c ON jg.idcompetition = c.idcompetition
                LEFT JOIN utilisateur u ON c.idutilisateur = u.idutilisateur
                WHERE jg.idjuge = $1
                ORDER BY c.datecompetition DESC
            `;
            
            const competitionsResult = await pool.query(competitionsQuery, [id]);
            const competitions: CompetitionAssignment[] = competitionsResult.rows;

            const userQuery = `
                SELECT idutilisateur FROM utilisateur WHERE idjuge = $1
            `;
            const userResult = await pool.query(userQuery, [id]);
            const hasUserAccount = userResult.rows.length > 0;
            const idutilisateur = hasUserAccount ? userResult.rows[0].idutilisateur : undefined;

            return {
                ...juge,
                competitions,
                hasUserAccount,
                idutilisateur
            };
        } catch (error) {
            console.error('Erreur lors de la récupération du juge avec compétitions:', error);
            throw error;
        }
    }

    static async getJugesByCompetition(competitionId: number): Promise<Juge[]> {
        try {
            const query = `
                SELECT j.idjuge, j.nomjuge, j.prenomjuge
                FROM juger jg
                JOIN juge j ON jg.idjuge = j.idjuge
                WHERE jg.idcompetition = $1
                ORDER BY j.nomjuge, j.prenomjuge
            `;
            const result = await pool.query(query, [competitionId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des juges par compétition:', error);
            throw new Error('Erreur lors de la récupération des juges par compétition');
        }
    }

    static async getJugesForQRGeneration(competitionId: number): Promise<JugeForQR[]> {
        try {
            const query = `
                SELECT j.idjuge, j.nomjuge, j.prenomjuge,
                       u.idutilisateur,
                       CASE WHEN u.idutilisateur IS NOT NULL THEN true ELSE false END as canGenerateQR
                FROM juger jg
                JOIN juge j ON jg.idjuge = j.idjuge
                LEFT JOIN utilisateur u ON j.idjuge = u.idjuge AND u.idrole = 2
                WHERE jg.idcompetition = $1
                ORDER BY j.nomjuge, j.prenomjuge
            `;
            const result = await pool.query(query, [competitionId]);
            
            return result.rows.map(row => ({
                idjuge: row.idjuge,
                nomjuge: row.nomjuge,
                prenomjuge: row.prenomjuge,
                idutilisateur: row.idutilisateur,
                canGenerateQR: row.cangenerateqr
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des juges pour QR:', error);
            throw new Error('Erreur lors de la récupération des juges pour QR');
        }
    }

    static async createJuge(jugeData: CreateJugeRequest): Promise<CreateJugeResponse> {
        try {
            if (!jugeData.nomjuge || jugeData.nomjuge.trim().length === 0) {
                throw new Error('Le nom du juge est requis');
            }

            if (!jugeData.prenomjuge || jugeData.prenomjuge.trim().length === 0) {
                throw new Error('Le prénom du juge est requis');
            }

            if (jugeData.nomjuge.trim().length > 50) {
                throw new Error('Le nom ne peut pas dépasser 50 caractères');
            }

            if (jugeData.prenomjuge.trim().length > 50) {
                throw new Error('Le prénom ne peut pas dépasser 50 caractères');
            }

            const nomTrimmed = jugeData.nomjuge.trim();
            const prenomTrimmed = jugeData.prenomjuge.trim();

            const existingQuery = `
                SELECT idjuge FROM juge 
                WHERE LOWER(nomjuge) = LOWER($1) AND LOWER(prenomjuge) = LOWER($2)
            `;
            const existingResult = await pool.query(existingQuery, [nomTrimmed, prenomTrimmed]);
            if (existingResult.rows.length > 0) {
                throw new Error('Un juge avec ce nom et prénom existe déjà');
            }

            const insertQuery = `
                INSERT INTO juge (nomjuge, prenomjuge) 
                VALUES ($1, $2) 
                RETURNING idjuge, nomjuge, prenomjuge
            `;
            const insertResult = await pool.query(insertQuery, [nomTrimmed, prenomTrimmed]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du juge:', error);
            throw error;
        }
    }

    static async updateJuge(id: number, jugeData: UpdateJugeRequest): Promise<Juge> {
        try {
            const existingJuge = await this.getJugeById(id);

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (jugeData.nomjuge !== undefined) {
                const nomTrimmed = jugeData.nomjuge.trim();
                if (nomTrimmed.length === 0 || nomTrimmed.length > 50) {
                    throw new Error('Le nom doit contenir entre 1 et 50 caractères');
                }
                updateFields.push(`nomjuge = $${paramIndex}`);
                values.push(nomTrimmed);
                paramIndex++;
            }

            if (jugeData.prenomjuge !== undefined) {
                const prenomTrimmed = jugeData.prenomjuge.trim();
                if (prenomTrimmed.length === 0 || prenomTrimmed.length > 50) {
                    throw new Error('Le prénom doit contenir entre 1 et 50 caractères');
                }
                updateFields.push(`prenomjuge = $${paramIndex}`);
                values.push(prenomTrimmed);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            if (jugeData.nomjuge !== undefined || jugeData.prenomjuge !== undefined) {
                const newNom = jugeData.nomjuge !== undefined ? jugeData.nomjuge.trim() : existingJuge.nomjuge;
                const newPrenom = jugeData.prenomjuge !== undefined ? jugeData.prenomjuge.trim() : existingJuge.prenomjuge;
                
                const existingQuery = `
                    SELECT idjuge FROM juge 
                    WHERE LOWER(nomjuge) = LOWER($1) AND LOWER(prenomjuge) = LOWER($2) AND idjuge != $3
                `;
                const existingResult = await pool.query(existingQuery, [newNom, newPrenom, id]);
                if (existingResult.rows.length > 0) {
                    throw new Error('Un juge avec ce nom et prénom existe déjà');
                }
            }

            values.push(id);
            const updateQuery = `
                UPDATE juge 
                SET ${updateFields.join(', ')} 
                WHERE idjuge = $${paramIndex}
                RETURNING idjuge, nomjuge, prenomjuge
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Juge non trouvé');
            }

            return await this.getJugeById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du juge:', error);
            throw error;
        }
    }

    static async deleteJuge(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.getJugeById(id);
            
            await client.query('DELETE FROM juger WHERE idjuge = $1', [id]);
            await client.query('UPDATE utilisateur SET idjuge = NULL WHERE idjuge = $1', [id]);
            await client.query('DELETE FROM juge WHERE idjuge = $1', [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression du juge:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async getAvailableJugesForCompetition(competitionId: number): Promise<Juge[]> {
        try {
            const query = `
                SELECT j.idjuge, j.nomjuge, j.prenomjuge
                FROM juge j
                WHERE j.idjuge NOT IN (
                    SELECT jg.idjuge 
                    FROM juger jg 
                    WHERE jg.idcompetition = $1
                )
                ORDER BY j.nomjuge, j.prenomjuge
            `;
            const result = await pool.query(query, [competitionId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des juges disponibles:', error);
            throw new Error('Erreur lors de la récupération des juges disponibles');
        }
    }
}