import { pool } from '../config/database';
import { Materiel, CreateMaterielRequest, UpdateMaterielRequest, CreateMaterielResponse, MaterielWithQuantite } from '../models/Materiel';

export class MaterielService {

    static async getAllMateriels(): Promise<Materiel[]> {
        try {
            const query = `
                SELECT idmateriel, libelle
                FROM materiel
                ORDER BY idmateriel ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des matériels:', error);
            throw new Error('Erreur lors de la récupération des matériels');
        }
    }

    static async getMaterielById(id: number): Promise<Materiel> {
        try {
            const query = `
                SELECT idmateriel, libelle
                FROM materiel
                WHERE idmateriel = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Matériel non trouvé');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du matériel:', error);
            throw error;
        }
    }

    static async getMaterielsByEpreuve(epreuveId: number): Promise<MaterielWithQuantite[]> {
        try {
            const query = `
                SELECT m.idmateriel, m.libelle, a.quantite
                FROM materiel m
                INNER JOIN avoir a ON m.idmateriel = a.idmateriel
                WHERE a.idepreuve = $1
                ORDER BY m.idmateriel ASC
            `;
            const result = await pool.query(query, [epreuveId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des matériels par épreuve:', error);
            throw new Error('Erreur lors de la récupération des matériels par épreuve');
        }
    }

    static async createMateriel(materielData: CreateMaterielRequest): Promise<CreateMaterielResponse> {
        try {
            if (!materielData.libelle || materielData.libelle.trim().length === 0) {
                throw new Error('Le libellé est requis');
            }

            if (materielData.libelle.trim().length > 200) {
                throw new Error('Le libellé ne peut pas dépasser 200 caractères');
            }

            const libelleTrimmed = materielData.libelle.trim();

            const insertQuery = `
                INSERT INTO materiel (libelle) 
                VALUES ($1) 
                RETURNING idmateriel, libelle
            `;
            const insertResult = await pool.query(insertQuery, [libelleTrimmed]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du matériel:', error);
            throw error;
        }
    }

    static async updateMateriel(id: number, materielData: UpdateMaterielRequest): Promise<Materiel> {
        try {
            const existingMateriel = await this.getMaterielById(id);

            if (materielData.libelle === undefined) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            const libelleTrimmed = materielData.libelle.trim();
            if (libelleTrimmed.length === 0 || libelleTrimmed.length > 200) {
                throw new Error('Le libellé doit contenir entre 1 et 200 caractères');
            }

            const updateQuery = `
                UPDATE materiel 
                SET libelle = $1 
                WHERE idmateriel = $2
                RETURNING idmateriel, libelle
            `;

            const updateResult = await pool.query(updateQuery, [libelleTrimmed, id]);

            if (updateResult.rows.length === 0) {
                throw new Error('Matériel non trouvé');
            }

            return updateResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la mise à jour du matériel:', error);
            throw error;
        }
    }

    static async deleteMateriel(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await this.getMaterielById(id);
            await client.query('DELETE FROM avoir WHERE idmateriel = $1', [id]);
            await client.query('DELETE FROM materiel WHERE idmateriel = $1', [id]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression du matériel:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async assignMaterielToEpreuve(epreuveId: number, materielId: number, quantite: number): Promise<void> {
        try {
            const epreuveCheckQuery = 'SELECT idepreuve FROM epreuve WHERE idepreuve = $1';
            const epreuveCheckResult = await pool.query(epreuveCheckQuery, [epreuveId]);
            if (epreuveCheckResult.rows.length === 0) {
                throw new Error('L\'épreuve spécifiée n\'existe pas');
            }

            await this.getMaterielById(materielId);

            if (!quantite || quantite <= 0) {
                throw new Error('La quantité doit être un nombre positif');
            }

            const existingQuery = 'SELECT * FROM avoir WHERE idepreuve = $1 AND idmateriel = $2';
            const existingResult = await pool.query(existingQuery, [epreuveId, materielId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Ce matériel est déjà assigné à cette épreuve');
            }

            const insertQuery = 'INSERT INTO avoir (idepreuve, idmateriel, quantite) VALUES ($1, $2, $3)';
            await pool.query(insertQuery, [epreuveId, materielId, quantite]);
        } catch (error) {
            console.error('Erreur lors de l\'assignation du matériel à l\'épreuve:', error);
            throw error;
        }
    }

    static async updateMaterielQuantiteForEpreuve(epreuveId: number, materielId: number, quantite: number): Promise<void> {
        try {
            if (!quantite || quantite <= 0) {
                throw new Error('La quantité doit être un nombre positif');
            }

            const updateQuery = 'UPDATE avoir SET quantite = $3 WHERE idepreuve = $1 AND idmateriel = $2';
            const result = await pool.query(updateQuery, [epreuveId, materielId, quantite]);
            
            if (result.rowCount === 0) {
                throw new Error('Association épreuve-matériel non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la quantité:', error);
            throw error;
        }
    }

    static async removeMaterielFromEpreuve(epreuveId: number, materielId: number): Promise<void> {
        try {
            const deleteQuery = 'DELETE FROM avoir WHERE idepreuve = $1 AND idmateriel = $2';
            const result = await pool.query(deleteQuery, [epreuveId, materielId]);
            
            if (result.rowCount === 0) {
                throw new Error('Association épreuve-matériel non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'association épreuve-matériel:', error);
            throw error;
        }
    }
}