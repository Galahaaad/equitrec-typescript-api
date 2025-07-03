import { pool } from '../config/database';
import { Caracteristique, CreateCaracteristiqueRequest, UpdateCaracteristiqueRequest, CreateCaracteristiqueResponse } from '../models/Caracteristique';

export class CaracteristiqueService {

    static async getAllCaracteristiques(): Promise<Caracteristique[]> {
        try {
            const query = `
                SELECT idcaracteristique, libelle, description
                FROM caracteristique
                ORDER BY idcaracteristique ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des caractéristiques:', error);
            throw new Error('Erreur lors de la récupération des caractéristiques');
        }
    }

    static async getCaracteristiqueById(id: number): Promise<Caracteristique> {
        try {
            const query = `
                SELECT idcaracteristique, libelle, description
                FROM caracteristique
                WHERE idcaracteristique = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Caractéristique non trouvée');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération de la caractéristique:', error);
            throw error;
        }
    }

    static async getCaracteristiquesByEpreuve(epreuveId: number): Promise<Caracteristique[]> {
        try {
            const query = `
                SELECT c.idcaracteristique, c.libelle, c.description
                FROM caracteristique c
                INNER JOIN posseder p ON c.idcaracteristique = p.idcaracteristique
                WHERE p.idepreuve = $1
                ORDER BY c.idcaracteristique ASC
            `;
            const result = await pool.query(query, [epreuveId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des caractéristiques par épreuve:', error);
            throw new Error('Erreur lors de la récupération des caractéristiques par épreuve');
        }
    }

    static async createCaracteristique(caracteristiqueData: CreateCaracteristiqueRequest): Promise<CreateCaracteristiqueResponse> {
        try {
            if (!caracteristiqueData.libelle || caracteristiqueData.libelle.trim().length === 0) {
                throw new Error('Le libellé est requis');
            }

            if (!caracteristiqueData.description || caracteristiqueData.description.trim().length === 0) {
                throw new Error('La description est requise');
            }

            if (caracteristiqueData.libelle.trim().length > 200) {
                throw new Error('Le libellé ne peut pas dépasser 200 caractères');
            }

            if (caracteristiqueData.description.trim().length > 500) {
                throw new Error('La description ne peut pas dépasser 500 caractères');
            }

            const libelleTrimmed = caracteristiqueData.libelle.trim();
            const descriptionTrimmed = caracteristiqueData.description.trim();

            const insertQuery = `
                INSERT INTO caracteristique (libelle, description) 
                VALUES ($1, $2) 
                RETURNING idcaracteristique, libelle, description
            `;
            const insertResult = await pool.query(insertQuery, [
                libelleTrimmed,
                descriptionTrimmed
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création de la caractéristique:', error);
            throw error;
        }
    }

    static async updateCaracteristique(id: number, caracteristiqueData: UpdateCaracteristiqueRequest): Promise<Caracteristique> {
        try {
            const existingCaracteristique = await this.getCaracteristiqueById(id);

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (caracteristiqueData.libelle !== undefined) {
                const libelleTrimmed = caracteristiqueData.libelle.trim();
                if (libelleTrimmed.length === 0 || libelleTrimmed.length > 200) {
                    throw new Error('Le libellé doit contenir entre 1 et 200 caractères');
                }
                updateFields.push(`libelle = $${paramIndex}`);
                values.push(libelleTrimmed);
                paramIndex++;
            }

            if (caracteristiqueData.description !== undefined) {
                const descriptionTrimmed = caracteristiqueData.description.trim();
                if (descriptionTrimmed.length === 0 || descriptionTrimmed.length > 500) {
                    throw new Error('La description doit contenir entre 1 et 500 caractères');
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
                UPDATE caracteristique 
                SET ${updateFields.join(', ')} 
                WHERE idcaracteristique = $${paramIndex}
                RETURNING idcaracteristique, libelle, description
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Caractéristique non trouvée');
            }

            return updateResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la caractéristique:', error);
            throw error;
        }
    }

    static async deleteCaracteristique(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await this.getCaracteristiqueById(id);
            await client.query('DELETE FROM posseder WHERE idcaracteristique = $1', [id]);
            await client.query('DELETE FROM caracteristique WHERE idcaracteristique = $1', [id]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de la caractéristique:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async assignCaracteristiqueToEpreuve(epreuveId: number, caracteristiqueId: number): Promise<void> {
        try {
            const epreuveCheckQuery = 'SELECT idepreuve FROM epreuve WHERE idepreuve = $1';
            const epreuveCheckResult = await pool.query(epreuveCheckQuery, [epreuveId]);
            if (epreuveCheckResult.rows.length === 0) {
                throw new Error('L\'épreuve spécifiée n\'existe pas');
            }

            await this.getCaracteristiqueById(caracteristiqueId);

            const existingQuery = 'SELECT * FROM posseder WHERE idepreuve = $1 AND idcaracteristique = $2';
            const existingResult = await pool.query(existingQuery, [epreuveId, caracteristiqueId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Cette caractéristique est déjà assignée à cette épreuve');
            }

            const insertQuery = 'INSERT INTO posseder (idepreuve, idcaracteristique) VALUES ($1, $2)';
            await pool.query(insertQuery, [epreuveId, caracteristiqueId]);
        } catch (error) {
            console.error('Erreur lors de l\'assignation de la caractéristique à l\'épreuve:', error);
            throw error;
        }
    }

    static async removeCaracteristiqueFromEpreuve(epreuveId: number, caracteristiqueId: number): Promise<void> {
        try {
            const deleteQuery = 'DELETE FROM posseder WHERE idepreuve = $1 AND idcaracteristique = $2';
            const result = await pool.query(deleteQuery, [epreuveId, caracteristiqueId]);
            
            if (result.rowCount === 0) {
                throw new Error('Association épreuve-caractéristique non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'association épreuve-caractéristique:', error);
            throw error;
        }
    }
}