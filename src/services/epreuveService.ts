import { pool } from '../config/database';
import { Epreuve, CreateEpreuveRequest, UpdateEpreuveRequest, CreateEpreuveResponse } from '../models/Epreuve';

export class EpreuveService {

    static async getAllEpreuves(): Promise<Epreuve[]> {
        try {
            const query = `
                SELECT e.idepreuve, e.titre, e.description, e.idjuge,
                       j.nomjuge, j.prenomjuge
                FROM epreuve e
                LEFT JOIN juge j ON e.idjuge = j.idjuge
                ORDER BY e.idepreuve ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des épreuves:', error);
            throw new Error('Erreur lors de la récupération des épreuves');
        }
    }

    static async getEpreuveById(id: number): Promise<Epreuve> {
        try {
            const query = `
                SELECT e.idepreuve, e.titre, e.description, e.idjuge,
                       j.nomjuge, j.prenomjuge
                FROM epreuve e
                LEFT JOIN juge j ON e.idjuge = j.idjuge
                WHERE e.idepreuve = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Épreuve non trouvée');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'épreuve:', error);
            throw error;
        }
    }

    static async getEpreuvesByJuge(jugeId: number): Promise<Epreuve[]> {
        try {
            const query = `
                SELECT e.idepreuve, e.titre, e.description, e.idjuge,
                       j.nomjuge, j.prenomjuge
                FROM epreuve e
                LEFT JOIN juge j ON e.idjuge = j.idjuge
                WHERE e.idjuge = $1
                ORDER BY e.idepreuve ASC
            `;
            const result = await pool.query(query, [jugeId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des épreuves par juge:', error);
            throw new Error('Erreur lors de la récupération des épreuves par juge');
        }
    }

    static async createEpreuve(epreuveData: CreateEpreuveRequest): Promise<CreateEpreuveResponse> {
        try {
            if (!epreuveData.titre || epreuveData.titre.trim().length === 0) {
                throw new Error('Le titre est requis');
            }

            if (!epreuveData.description || epreuveData.description.trim().length === 0) {
                throw new Error('La description est requise');
            }

            if (epreuveData.titre.trim().length > 100) {
                throw new Error('Le titre ne peut pas dépasser 100 caractères');
            }

            if (epreuveData.description.trim().length > 500) {
                throw new Error('La description ne peut pas dépasser 500 caractères');
            }

            const titreTrimmed = epreuveData.titre.trim();
            const descriptionTrimmed = epreuveData.description.trim();

            // Vérifier que le juge existe
            const jugeCheckQuery = 'SELECT idjuge FROM juge WHERE idjuge = $1';
            const jugeCheckResult = await pool.query(jugeCheckQuery, [epreuveData.idjuge]);
            if (jugeCheckResult.rows.length === 0) {
                throw new Error('Le juge spécifié n\'existe pas');
            }

            const insertQuery = `
                INSERT INTO epreuve (titre, description, idjuge) 
                VALUES ($1, $2, $3) 
                RETURNING idepreuve, titre, description, idjuge
            `;
            const insertResult = await pool.query(insertQuery, [
                titreTrimmed,
                descriptionTrimmed,
                epreuveData.idjuge
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création de l\'épreuve:', error);
            throw error;
        }
    }

    static async updateEpreuve(id: number, epreuveData: UpdateEpreuveRequest): Promise<Epreuve> {
        try {
            const existingEpreuve = await this.getEpreuveById(id);

            if (epreuveData.idjuge !== undefined && epreuveData.idjuge !== null) {
                const jugeQuery = 'SELECT idjuge FROM juge WHERE idjuge = $1';
                const jugeResult = await pool.query(jugeQuery, [epreuveData.idjuge]);

                if (jugeResult.rows.length === 0) {
                    throw new Error('Le juge spécifié n\'existe pas');
                }
            }

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (epreuveData.titre !== undefined) {
                const titreTrimmed = epreuveData.titre.trim();
                if (titreTrimmed.length === 0 || titreTrimmed.length > 100) {
                    throw new Error('Le titre doit contenir entre 1 et 100 caractères');
                }
                updateFields.push(`titre = $${paramIndex}`);
                values.push(titreTrimmed);
                paramIndex++;
            }

            if (epreuveData.description !== undefined) {
                const descriptionTrimmed = epreuveData.description.trim();
                if (descriptionTrimmed.length === 0 || descriptionTrimmed.length > 500) {
                    throw new Error('La description doit contenir entre 1 et 500 caractères');
                }
                updateFields.push(`description = $${paramIndex}`);
                values.push(descriptionTrimmed);
                paramIndex++;
            }

            if (epreuveData.idjuge !== undefined) {
                updateFields.push(`idjuge = $${paramIndex}`);
                values.push(epreuveData.idjuge);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
                UPDATE epreuve 
                SET ${updateFields.join(', ')} 
                WHERE idepreuve = $${paramIndex}
                RETURNING idepreuve, titre, description, idjuge
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Épreuve non trouvée');
            }

            return await this.getEpreuveById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'épreuve:', error);
            throw error;
        }
    }

    static async deleteEpreuve(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await this.getEpreuveById(id);
            await client.query('DELETE FROM detenir WHERE idepreuve = $1', [id]);
            await client.query('DELETE FROM posseder WHERE idepreuve = $1', [id]);
            await client.query('DELETE FROM epreuve WHERE idepreuve = $1', [id]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de l\'épreuve:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}