import { pool } from '../config/database';
import { Critere, CreateCritereRequest, UpdateCritereRequest, CreateCritereResponse } from '../models/Critere';

export class CritereService {

    static async getAllCriteres(): Promise<Critere[]> {
        try {
            const query = `
                SELECT c.idcritere, c.libelle, c.idniveau,
                       n.libelle as libelleniveau, n.description as descriptionniveau
                FROM critere c
                LEFT JOIN niveau n ON c.idniveau = n.idniveau
                ORDER BY c.libelle ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des critères:', error);
            throw new Error('Erreur lors de la récupération des critères');
        }
    }

    static async getCritereById(id: number): Promise<Critere> {
        try {
            const query = `
                SELECT c.idcritere, c.libelle, c.idniveau,
                       n.libelle as libelleniveau, n.description as descriptionniveau
                FROM critere c
                LEFT JOIN niveau n ON c.idniveau = n.idniveau
                WHERE c.idcritere = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Critère non trouvé');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du critère:', error);
            throw error;
        }
    }

    static async createCritere(critereData: CreateCritereRequest): Promise<CreateCritereResponse> {
        try {
            if (!critereData.libelle || critereData.libelle.trim().length === 0) {
                throw new Error('Le libellé est requis');
            }

            if (!critereData.idniveau) {
                throw new Error('Le niveau est requis');
            }

            if (critereData.libelle.trim().length > 100) {
                throw new Error('Le libellé ne peut pas dépasser 100 caractères');
            }

            const libelleTrimmed = critereData.libelle.trim();

            // Vérifier que le niveau existe
            const niveauQuery = 'SELECT idniveau FROM niveau WHERE idniveau = $1';
            const niveauResult = await pool.query(niveauQuery, [critereData.idniveau]);
            if (niveauResult.rows.length === 0) {
                throw new Error('Le niveau spécifié n\'existe pas');
            }

            // Vérifier l'unicité du libellé
            const checkQuery = 'SELECT idcritere FROM critere WHERE LOWER(libelle) = LOWER($1)';
            const checkResult = await pool.query(checkQuery, [libelleTrimmed]);
            if (checkResult.rows.length > 0) {
                throw new Error('Un critère avec ce libellé existe déjà');
            }

            const insertQuery = `
                INSERT INTO critere (libelle, idniveau) 
                VALUES ($1, $2) 
                RETURNING idcritere, libelle, idniveau
            `;
            const insertResult = await pool.query(insertQuery, [
                libelleTrimmed,
                critereData.idniveau
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du critère:', error);
            throw error;
        }
    }

    static async updateCritere(id: number, critereData: UpdateCritereRequest): Promise<Critere> {
        try {
            const existingCritere = await this.getCritereById(id);

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (critereData.libelle !== undefined) {
                const libelleTrimmed = critereData.libelle.trim();
                if (libelleTrimmed.length === 0 || libelleTrimmed.length > 100) {
                    throw new Error('Le libellé doit contenir entre 1 et 100 caractères');
                }

                // Vérifier l'unicité du libellé (sauf pour le critère actuel)
                const checkQuery = 'SELECT idcritere FROM critere WHERE LOWER(libelle) = LOWER($1) AND idcritere != $2';
                const checkResult = await pool.query(checkQuery, [libelleTrimmed, id]);
                if (checkResult.rows.length > 0) {
                    throw new Error('Un critère avec ce libellé existe déjà');
                }

                updateFields.push(`libelle = $${paramIndex}`);
                values.push(libelleTrimmed);
                paramIndex++;
            }

            if (critereData.idniveau !== undefined) {
                // Vérifier que le niveau existe
                const niveauQuery = 'SELECT idniveau FROM niveau WHERE idniveau = $1';
                const niveauResult = await pool.query(niveauQuery, [critereData.idniveau]);
                if (niveauResult.rows.length === 0) {
                    throw new Error('Le niveau spécifié n\'existe pas');
                }

                updateFields.push(`idniveau = $${paramIndex}`);
                values.push(critereData.idniveau);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
                UPDATE critere 
                SET ${updateFields.join(', ')} 
                WHERE idcritere = $${paramIndex}
                RETURNING idcritere, libelle, idniveau
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Critère non trouvé');
            }

            return await this.getCritereById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du critère:', error);
            throw error;
        }
    }

    static async deleteCritere(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.getCritereById(id);
            
            // Supprimer les références dans la table detenir (Critère ↔ Épreuve)
            await client.query('DELETE FROM detenir WHERE idcritere = $1', [id]);
            
            // Supprimer le critère
            await client.query('DELETE FROM critere WHERE idcritere = $1', [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression du critère:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}