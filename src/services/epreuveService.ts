import { pool } from '../config/database';
import { Epreuve, CreateEpreuveRequest, UpdateEpreuveRequest, CreateEpreuveResponse, EpreuveWithCompetitions, CompetitionInEpreuve } from '../models/Epreuve';
import { EpreuveWithCriteres, CritereInEpreuve } from '../models/EpreuveCritere';

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

            // Vérifier si un juge est fourni et s'il existe
            if (epreuveData.idjuge !== undefined && epreuveData.idjuge !== null) {
                const jugeCheckQuery = 'SELECT idjuge FROM juge WHERE idjuge = $1';
                const jugeCheckResult = await pool.query(jugeCheckQuery, [epreuveData.idjuge]);
                if (jugeCheckResult.rows.length === 0) {
                    throw new Error('Le juge spécifié n\'existe pas');
                }
            }

            const insertQuery = `
                INSERT INTO epreuve (titre, description, idjuge) 
                VALUES ($1, $2, $3) 
                RETURNING idepreuve, titre, description, idjuge
            `;
            const insertResult = await pool.query(insertQuery, [
                titreTrimmed,
                descriptionTrimmed,
                epreuveData.idjuge || null
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
            await client.query('DELETE FROM composer WHERE idepreuve = $1', [id]);
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

    static async getEpreuveWithCompetitions(id: number): Promise<EpreuveWithCompetitions> {
        try {
            const epreuve = await this.getEpreuveById(id);
            
            const competitionsQuery = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition, c.idutilisateur,
                       u.nomutilisateur, u.prenomutilisateur
                FROM composer comp
                JOIN competition c ON comp.idcompetition = c.idcompetition
                LEFT JOIN utilisateur u ON c.idutilisateur = u.idutilisateur
                WHERE comp.idepreuve = $1
                ORDER BY c.datecompetition DESC
            `;
            
            const competitionsResult = await pool.query(competitionsQuery, [id]);
            const competitions: CompetitionInEpreuve[] = competitionsResult.rows.map(row => ({
                idcompetition: row.idcompetition,
                nomcompetition: row.nomcompetition,
                datecompetition: row.datecompetition,
                idutilisateur: row.idutilisateur,
                nomutilisateur: row.nomutilisateur,
                prenomutilisateur: row.prenomutilisateur
            }));

            return {
                ...epreuve,
                competitions
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'épreuve avec compétitions:', error);
            throw error;
        }
    }

    static async addCompetitionToEpreuve(epreuveId: number, competitionId: number): Promise<void> {
        try {
            const epreuve = await this.getEpreuveById(epreuveId);

            const competitionCheckQuery = 'SELECT idcompetition FROM competition WHERE idcompetition = $1';
            const competitionCheckResult = await pool.query(competitionCheckQuery, [competitionId]);
            if (competitionCheckResult.rows.length === 0) {
                throw new Error('La compétition spécifiée n\'existe pas');
            }

            if (epreuve.idjuge) {
                const judgeAssignmentQuery = 'SELECT 1 FROM juger WHERE idjuge = $1 AND idcompetition = $2';
                const judgeAssignmentResult = await pool.query(judgeAssignmentQuery, [epreuve.idjuge, competitionId]);
                
                if (judgeAssignmentResult.rows.length === 0) {
                    throw new Error('Le juge de cette épreuve n\'est pas assigné à cette compétition. Veuillez d\'abord assigner le juge à la compétition.');
                }

                const judgeConflictQuery = `
                    SELECT e.titre, e.idepreuve 
                    FROM composer c
                    JOIN epreuve e ON c.idepreuve = e.idepreuve
                    WHERE c.idcompetition = $1 AND e.idjuge = $2 AND e.idepreuve != $3
                `;
                const judgeConflictResult = await pool.query(judgeConflictQuery, [competitionId, epreuve.idjuge, epreuveId]);
                
                if (judgeConflictResult.rows.length > 0) {
                    const conflictingEpreuve = judgeConflictResult.rows[0];
                    throw new Error(`Conflit d'horaires: Le juge a déjà l'épreuve "${conflictingEpreuve.titre}" (ID: ${conflictingEpreuve.idepreuve}) dans cette compétition. Un juge ne peut avoir qu'une seule épreuve par compétition.`);
                }
            }

            const existingQuery = 'SELECT * FROM composer WHERE idcompetition = $1 AND idepreuve = $2';
            const existingResult = await pool.query(existingQuery, [competitionId, epreuveId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Cette épreuve est déjà assignée à cette compétition');
            }

            const insertQuery = 'INSERT INTO composer (idcompetition, idepreuve) VALUES ($1, $2)';
            await pool.query(insertQuery, [competitionId, epreuveId]);
        } catch (error) {
            console.error('Erreur lors de l\'assignation de la compétition:', error);
            throw error;
        }
    }

    static async removeCompetitionFromEpreuve(epreuveId: number, competitionId: number): Promise<void> {
        try {
            const deleteQuery = 'DELETE FROM composer WHERE idcompetition = $1 AND idepreuve = $2';
            const result = await pool.query(deleteQuery, [competitionId, epreuveId]);
            
            if (result.rowCount === 0) {
                throw new Error('Assignation non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors du retrait de la compétition:', error);
            throw error;
        }
    }

    static async getEpreuveWithCriteres(id: number): Promise<EpreuveWithCriteres> {
        try {
            const epreuve = await this.getEpreuveById(id);

            const criteresQuery = `
                SELECT c.idcritere, c.libelle
                FROM detenir d
                JOIN critere c ON d.idcritere = c.idcritere
                WHERE d.idepreuve = $1
                ORDER BY c.libelle ASC
            `;
            
            const criteresResult = await pool.query(criteresQuery, [id]);
            const criteres: CritereInEpreuve[] = criteresResult.rows;

            return {
                idepreuve: epreuve.idepreuve,
                titre: epreuve.titre,
                description: epreuve.description,
                idjuge: epreuve.idjuge,
                nomjuge: epreuve.nomjuge,
                prenomjuge: epreuve.prenomjuge,
                criteres
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'épreuve avec critères:', error);
            throw error;
        }
    }

    static async assignCritereToEpreuve(epreuveId: number, critereId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await this.getEpreuveById(epreuveId);

            const critereCheckQuery = 'SELECT idcritere FROM critere WHERE idcritere = $1';
            const critereCheckResult = await client.query(critereCheckQuery, [critereId]);
            if (critereCheckResult.rows.length === 0) {
                throw new Error('Le critère spécifié n\'existe pas');
            }

            const existingQuery = 'SELECT * FROM detenir WHERE idepreuve = $1 AND idcritere = $2';
            const existingResult = await client.query(existingQuery, [epreuveId, critereId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Ce critère est déjà assigné à cette épreuve');
            }

            const insertQuery = 'INSERT INTO detenir (idepreuve, idcritere) VALUES ($1, $2)';
            await client.query(insertQuery, [epreuveId, critereId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de l\'assignation du critère:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async removeCritereFromEpreuve(epreuveId: number, critereId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkQuery = 'SELECT * FROM detenir WHERE idepreuve = $1 AND idcritere = $2';
            const checkResult = await client.query(checkQuery, [epreuveId, critereId]);
            if (checkResult.rows.length === 0) {
                throw new Error('Association critère-épreuve non trouvée');
            }

            const deleteQuery = 'DELETE FROM detenir WHERE idepreuve = $1 AND idcritere = $2';
            await client.query(deleteQuery, [epreuveId, critereId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors du retrait du critère:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}