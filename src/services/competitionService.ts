import { pool } from '../config/database';
import { Competition, CreateCompetitionRequest, UpdateCompetitionRequest, CreateCompetitionResponse, CompetitionWithJudges, JugeAssignment, CompetitionWithEpreuves, EpreuveInCompetition, CompetitionWithCavaliers, CavalierInCompetition } from '../models/Competition';

export class CompetitionService {

    static async getAllCompetitions(): Promise<Competition[]> {
        try {
            const query = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition, c.idutilisateur,
                       u.nomutilisateur, u.prenomutilisateur
                FROM competition c
                LEFT JOIN utilisateur u ON c.idutilisateur = u.idutilisateur
                ORDER BY c.datecompetition DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des compétitions:', error);
            throw new Error('Erreur lors de la récupération des compétitions');
        }
    }

    static async getCompetitionById(id: number): Promise<Competition> {
        try {
            const query = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition, c.idutilisateur,
                       u.nomutilisateur, u.prenomutilisateur
                FROM competition c
                LEFT JOIN utilisateur u ON c.idutilisateur = u.idutilisateur
                WHERE c.idcompetition = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Compétition non trouvée');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétition:', error);
            throw error;
        }
    }

    static async getCompetitionWithJudges(id: number): Promise<CompetitionWithJudges> {
        try {
            const competition = await this.getCompetitionById(id);
            
            const judgesQuery = `
                SELECT j.idjuge, j.nomjuge, j.prenomjuge,
                       u.idutilisateur,
                       CASE WHEN u.idutilisateur IS NOT NULL THEN true ELSE false END as hasUserAccount
                FROM juger jg
                JOIN juge j ON jg.idjuge = j.idjuge
                LEFT JOIN utilisateur u ON j.idjuge = u.idjuge
                WHERE jg.idcompetition = $1
                ORDER BY j.nomjuge, j.prenomjuge
            `;
            
            const judgesResult = await pool.query(judgesQuery, [id]);
            const juges: JugeAssignment[] = judgesResult.rows.map(row => ({
                idjuge: row.idjuge,
                nomjuge: row.nomjuge,
                prenomjuge: row.prenomjuge,
                hasUserAccount: row.hasuseraccount,
                idutilisateur: row.idutilisateur
            }));

            return {
                ...competition,
                juges
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétition avec juges:', error);
            throw error;
        }
    }

    static async getUpcomingCompetitions(): Promise<Competition[]> {
        try {
            const query = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition, c.idutilisateur,
                       u.nomutilisateur, u.prenomutilisateur
                FROM competition c
                LEFT JOIN utilisateur u ON c.idutilisateur = u.idutilisateur
                WHERE DATE(c.datecompetition) >= CURRENT_DATE
                ORDER BY c.datecompetition ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des compétitions à venir:', error);
            throw new Error('Erreur lors de la récupération des compétitions à venir');
        }
    }

    static async getCompetitionsByDate(date: string): Promise<Competition[]> {
        try {
            const query = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition, c.idutilisateur,
                       u.nomutilisateur, u.prenomutilisateur
                FROM competition c
                LEFT JOIN utilisateur u ON c.idutilisateur = u.idutilisateur
                WHERE DATE(c.datecompetition) = DATE($1)
                ORDER BY c.datecompetition ASC
            `;
            const result = await pool.query(query, [date]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des compétitions par date:', error);
            throw new Error('Erreur lors de la récupération des compétitions par date');
        }
    }

    static async createCompetition(competitionData: CreateCompetitionRequest): Promise<CreateCompetitionResponse> {
        try {
            if (!competitionData.nomcompetition) {
                throw new Error('Le nom de compétition est requis');
            }

            if (competitionData.nomcompetition.length > 100) {
                throw new Error('Le nom de compétition ne peut pas dépasser 100 caractères');
            }

            if (!competitionData.datecompetition) {
                throw new Error('La date de compétition est requise');
            }

            if (!competitionData.idutilisateur) {
                throw new Error('L\'organisateur est requis');
            }

            const competitionDate = new Date(competitionData.datecompetition);
            if (isNaN(competitionDate.getTime())) {
                throw new Error('Format de date invalide');
            }

            // Vérifier que l'utilisateur existe
            const userCheckQuery = 'SELECT idutilisateur FROM utilisateur WHERE idutilisateur = $1';
            const userCheckResult = await pool.query(userCheckQuery, [competitionData.idutilisateur]);
            if (userCheckResult.rows.length === 0) {
                throw new Error('L\'utilisateur organisateur spécifié n\'existe pas');
            }

            const insertQuery = `
                INSERT INTO competition (nomcompetition, datecompetition, idutilisateur) 
                VALUES ($1, $2, $3) 
                RETURNING idcompetition, nomcompetition, datecompetition, idutilisateur
            `;
            const insertResult = await pool.query(insertQuery, [
                competitionData.nomcompetition,
                competitionDate,
                competitionData.idutilisateur
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création de la compétition:', error);
            throw error;
        }
    }

    static async updateCompetition(id: number, competitionData: UpdateCompetitionRequest): Promise<Competition> {
        try {
            const existingCompetition = await this.getCompetitionById(id);

            if (competitionData.idutilisateur !== undefined) {
                const userQuery = 'SELECT idutilisateur FROM utilisateur WHERE idutilisateur = $1';
                const userResult = await pool.query(userQuery, [competitionData.idutilisateur]);

                if (userResult.rows.length === 0) {
                    throw new Error('L\'utilisateur organisateur spécifié n\'existe pas');
                }
            }

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (competitionData.nomcompetition !== undefined) {
                if (competitionData.nomcompetition.length > 100) {
                    throw new Error('Le nom de compétition ne peut pas dépasser 100 caractères');
                }
                updateFields.push(`nomcompetition = $${paramIndex}`);
                values.push(competitionData.nomcompetition);
                paramIndex++;
            }

            if (competitionData.datecompetition !== undefined) {
                const competitionDate = new Date(competitionData.datecompetition);
                if (isNaN(competitionDate.getTime())) {
                    throw new Error('Format de date invalide');
                }
                updateFields.push(`datecompetition = $${paramIndex}`);
                values.push(competitionDate);
                paramIndex++;
            }

            if (competitionData.idutilisateur !== undefined) {
                updateFields.push(`idutilisateur = $${paramIndex}`);
                values.push(competitionData.idutilisateur);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
                UPDATE competition 
                SET ${updateFields.join(', ')} 
                WHERE idcompetition = $${paramIndex}
                RETURNING idcompetition, nomcompetition, datecompetition, idutilisateur
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Compétition non trouvée');
            }

            return await this.getCompetitionById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la compétition:', error);
            throw error;
        }
    }

    static async deleteCompetition(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.getCompetitionById(id);
            
            await client.query('DELETE FROM juger WHERE idcompetition = $1', [id]);
            await client.query('DELETE FROM participer WHERE idcompetition = $1', [id]);
            await client.query('DELETE FROM composer WHERE idcompetition = $1', [id]);
            await client.query('DELETE FROM competition WHERE idcompetition = $1', [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de la compétition:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async assignJudgeToCompetition(competitionId: number, judgeId: number): Promise<void> {
        try {
            await this.getCompetitionById(competitionId);

            const judgeCheckQuery = 'SELECT idjuge FROM juge WHERE idjuge = $1';
            const judgeCheckResult = await pool.query(judgeCheckQuery, [judgeId]);
            if (judgeCheckResult.rows.length === 0) {
                throw new Error('Le juge spécifié n\'existe pas');
            }

            const existingQuery = 'SELECT * FROM juger WHERE idcompetition = $1 AND idjuge = $2';
            const existingResult = await pool.query(existingQuery, [competitionId, judgeId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Ce juge est déjà assigné à cette compétition');
            }

            const insertQuery = 'INSERT INTO juger (idcompetition, idjuge) VALUES ($1, $2)';
            await pool.query(insertQuery, [competitionId, judgeId]);
        } catch (error) {
            console.error('Erreur lors de l\'assignation du juge:', error);
            throw error;
        }
    }

    static async removeJudgeFromCompetition(competitionId: number, judgeId: number): Promise<void> {
        try {
            const deleteQuery = 'DELETE FROM juger WHERE idcompetition = $1 AND idjuge = $2';
            const result = await pool.query(deleteQuery, [competitionId, judgeId]);
            
            if (result.rowCount === 0) {
                throw new Error('Assignation non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors du retrait du juge:', error);
            throw error;
        }
    }

    static async getCompetitionWithEpreuves(id: number): Promise<CompetitionWithEpreuves> {
        try {
            const competition = await this.getCompetitionById(id);
            
            const epreuvesQuery = `
                SELECT e.idepreuve, e.titre, e.description, e.idjuge,
                       j.nomjuge, j.prenomjuge
                FROM composer c
                JOIN epreuve e ON c.idepreuve = e.idepreuve
                LEFT JOIN juge j ON e.idjuge = j.idjuge
                WHERE c.idcompetition = $1
                ORDER BY e.titre
            `;
            
            const epreuvesResult = await pool.query(epreuvesQuery, [id]);
            const epreuves: EpreuveInCompetition[] = epreuvesResult.rows.map(row => ({
                idepreuve: row.idepreuve,
                titre: row.titre,
                description: row.description,
                idjuge: row.idjuge,
                nomjuge: row.nomjuge,
                prenomjuge: row.prenomjuge
            }));

            return {
                ...competition,
                epreuves
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétition avec épreuves:', error);
            throw error;
        }
    }

    static async addEpreuveToCompetition(competitionId: number, epreuveId: number): Promise<void> {
        try {
            await this.getCompetitionById(competitionId);

            const epreuveCheckQuery = 'SELECT idepreuve FROM epreuve WHERE idepreuve = $1';
            const epreuveCheckResult = await pool.query(epreuveCheckQuery, [epreuveId]);
            if (epreuveCheckResult.rows.length === 0) {
                throw new Error('L\'épreuve spécifiée n\'existe pas');
            }

            const existingQuery = 'SELECT * FROM composer WHERE idcompetition = $1 AND idepreuve = $2';
            const existingResult = await pool.query(existingQuery, [competitionId, epreuveId]);
            if (existingResult.rows.length > 0) {
                throw new Error('Cette épreuve est déjà assignée à cette compétition');
            }

            const insertQuery = 'INSERT INTO composer (idcompetition, idepreuve) VALUES ($1, $2)';
            await pool.query(insertQuery, [competitionId, epreuveId]);
        } catch (error) {
            console.error('Erreur lors de l\'assignation de l\'épreuve:', error);
            throw error;
        }
    }

    static async removeEpreuveFromCompetition(competitionId: number, epreuveId: number): Promise<void> {
        try {
            const deleteQuery = 'DELETE FROM composer WHERE idcompetition = $1 AND idepreuve = $2';
            const result = await pool.query(deleteQuery, [competitionId, epreuveId]);
            
            if (result.rowCount === 0) {
                throw new Error('Assignation non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors du retrait de l\'épreuve:', error);
            throw error;
        }
    }

    static async getCompetitionWithCavaliers(id: number): Promise<CompetitionWithCavaliers> {
        try {
            const competition = await this.getCompetitionById(id);
            
            const cavaliersQuery = `
                SELECT c.idcavalier, c.nomcavalier, c.prenomcavalier, c.numerodossard, c.idclub,
                       cl.nomclub, p.idniveau, n.libelle as libelleniveau
                FROM participer p
                JOIN cavalier c ON p.idcavalier = c.idcavalier
                JOIN club cl ON c.idclub = cl.idclub
                JOIN niveau n ON p.idniveau = n.idniveau
                WHERE p.idcompetition = $1
                ORDER BY c.nomcavalier, c.prenomcavalier
            `;
            
            const cavaliersResult = await pool.query(cavaliersQuery, [id]);
            const cavaliers: CavalierInCompetition[] = cavaliersResult.rows.map(row => ({
                idcavalier: row.idcavalier,
                nomcavalier: row.nomcavalier,
                prenomcavalier: row.prenomcavalier,
                numerodossard: row.numerodossard,
                idclub: row.idclub,
                nomclub: row.nomclub,
                idniveau: row.idniveau,
                libelleniveau: row.libelleniveau
            }));

            return {
                ...competition,
                cavaliers
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétition avec cavaliers:', error);
            throw error;
        }
    }
}