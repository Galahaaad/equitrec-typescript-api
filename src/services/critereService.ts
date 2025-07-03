import { pool } from '../config/database';
import { Critere, CreateCritereRequest, UpdateCritereRequest, CreateCritereResponse } from '../models/Critere';
import { CritereWithEpreuves, EpreuveInCritere } from '../models/EpreuveCritere';

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

            const niveauQuery = 'SELECT idniveau FROM niveau WHERE idniveau = $1';
            const niveauResult = await pool.query(niveauQuery, [critereData.idniveau]);
            if (niveauResult.rows.length === 0) {
                throw new Error('Le niveau spécifié n\'existe pas');
            }

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
            
            await client.query('DELETE FROM detenir WHERE idcritere = $1', [id]);
            
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

    static async getCritereWithEpreuves(id: number): Promise<CritereWithEpreuves> {
        try {
            const critere = await this.getCritereById(id);

            const epreuvesQuery = `
                SELECT e.idepreuve, e.titre as nomepreuve, e.description, e.idjuge,
                       j.nomjuge, j.prenomjuge
                FROM detenir d
                JOIN epreuve e ON d.idepreuve = e.idepreuve
                LEFT JOIN juge j ON e.idjuge = j.idjuge
                WHERE d.idcritere = $1
                ORDER BY e.titre ASC
            `;
            
            const epreuvesResult = await pool.query(epreuvesQuery, [id]);
            const epreuves: EpreuveInCritere[] = epreuvesResult.rows;

            return {
                idcritere: critere.idcritere,
                libelle: critere.libelle,
                idniveau: critere.idniveau,
                libelleniveau: critere.libelleniveau,
                descriptionniveau: critere.descriptionniveau,
                epreuves
            };
        } catch (error) {
            console.error('Erreur lors de la récupération du critère avec épreuves:', error);
            throw error;
        }
    }

    static async getEpreuvesByCritere(critereId: number): Promise<EpreuveInCritere[]> {
        try {
            await this.getCritereById(critereId);

            const query = `
                SELECT e.idepreuve, e.titre as nomepreuve, e.description, e.idjuge,
                       j.nomjuge, j.prenomjuge
                FROM detenir d
                JOIN epreuve e ON d.idepreuve = e.idepreuve
                LEFT JOIN juge j ON e.idjuge = j.idjuge
                WHERE d.idcritere = $1
                ORDER BY e.titre ASC
            `;
            
            const result = await pool.query(query, [critereId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des épreuves par critère:', error);
            throw error;
        }
    }

    static async assignEpreuveToCritere(critereId: number, epreuveId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await this.getCritereById(critereId);

            const epreuveCheckQuery = 'SELECT idepreuve FROM epreuve WHERE idepreuve = $1';
            const epreuveCheckResult = await client.query(epreuveCheckQuery, [epreuveId]);
            if (epreuveCheckResult.rows.length === 0) {
                throw new Error('L\'épreuve spécifiée n\'existe pas');
            }

            const existingQuery = 'SELECT * FROM detenir WHERE idcritere = $1 AND idepreuve = $2';
            const existingResult = await client.query(existingQuery, [critereId, epreuveId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Cette épreuve est déjà assignée à ce critère');
            }

            const insertQuery = 'INSERT INTO detenir (idcritere, idepreuve) VALUES ($1, $2)';
            await client.query(insertQuery, [critereId, epreuveId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de l\'assignation de l\'épreuve:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}