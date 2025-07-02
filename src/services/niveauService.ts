import { pool } from '../config/database';
import { Niveau, CreateNiveauRequest, UpdateNiveauRequest, CreateNiveauResponse } from '../models/Niveau';

export class NiveauService {

    static async getAllNiveaux(): Promise<Niveau[]> {
        try {
            const query = `
                SELECT idniveau, libelle, description
                FROM niveau
                ORDER BY libelle ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des niveaux:', error);
            throw new Error('Erreur lors de la récupération des niveaux');
        }
    }

    static async getNiveauById(id: number): Promise<Niveau> {
        try {
            const query = `
                SELECT idniveau, libelle, description
                FROM niveau
                WHERE idniveau = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Niveau non trouvé');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du niveau:', error);
            throw error;
        }
    }

    static async createNiveau(niveauData: CreateNiveauRequest): Promise<CreateNiveauResponse> {
        try {
            if (!niveauData.libelle || niveauData.libelle.trim().length === 0) {
                throw new Error('Le libellé est requis');
            }

            if (!niveauData.description || niveauData.description.trim().length === 0) {
                throw new Error('La description est requise');
            }

            if (niveauData.libelle.trim().length > 50) {
                throw new Error('Le libellé ne peut pas dépasser 50 caractères');
            }

            if (niveauData.description.trim().length > 255) {
                throw new Error('La description ne peut pas dépasser 255 caractères');
            }

            const libelleTrimmed = niveauData.libelle.trim();
            const descriptionTrimmed = niveauData.description.trim();

            // Vérifier l'unicité du libellé
            const checkQuery = 'SELECT idniveau FROM niveau WHERE LOWER(libelle) = LOWER($1)';
            const checkResult = await pool.query(checkQuery, [libelleTrimmed]);
            if (checkResult.rows.length > 0) {
                throw new Error('Un niveau avec ce libellé existe déjà');
            }

            const insertQuery = `
                INSERT INTO niveau (libelle, description) 
                VALUES ($1, $2) 
                RETURNING idniveau, libelle, description
            `;
            const insertResult = await pool.query(insertQuery, [
                libelleTrimmed,
                descriptionTrimmed
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du niveau:', error);
            throw error;
        }
    }

    static async updateNiveau(id: number, niveauData: UpdateNiveauRequest): Promise<Niveau> {
        try {
            const existingNiveau = await this.getNiveauById(id);

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (niveauData.libelle !== undefined) {
                const libelleTrimmed = niveauData.libelle.trim();
                if (libelleTrimmed.length === 0 || libelleTrimmed.length > 50) {
                    throw new Error('Le libellé doit contenir entre 1 et 50 caractères');
                }

                // Vérifier l'unicité du libellé (sauf pour le niveau actuel)
                const checkQuery = 'SELECT idniveau FROM niveau WHERE LOWER(libelle) = LOWER($1) AND idniveau != $2';
                const checkResult = await pool.query(checkQuery, [libelleTrimmed, id]);
                if (checkResult.rows.length > 0) {
                    throw new Error('Un niveau avec ce libellé existe déjà');
                }

                updateFields.push(`libelle = $${paramIndex}`);
                values.push(libelleTrimmed);
                paramIndex++;
            }

            if (niveauData.description !== undefined) {
                const descriptionTrimmed = niveauData.description.trim();
                if (descriptionTrimmed.length === 0 || descriptionTrimmed.length > 255) {
                    throw new Error('La description doit contenir entre 1 et 255 caractères');
                }
                updateFields.push(`description = $${paramIndex}`);
                values.push(descriptionTrimmed);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
                UPDATE niveau 
                SET ${updateFields.join(', ')} 
                WHERE idniveau = $${paramIndex}
                RETURNING idniveau, libelle, description
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Niveau non trouvé');
            }

            return updateResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la mise à jour du niveau:', error);
            throw error;
        }
    }

    static async deleteNiveau(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.getNiveauById(id);
            
            // Supprimer les références dans la table participer (Romain je te détèste)
            await client.query('DELETE FROM participer WHERE idniveau = $1', [id]);
            
            // Supprimer le niveau
            await client.query('DELETE FROM niveau WHERE idniveau = $1', [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression du niveau:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}