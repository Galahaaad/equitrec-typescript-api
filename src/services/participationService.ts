import { pool } from '../config/database';
import { 
    Participation, 
    ParticipationComplete, 
    CreateParticipationRequest, 
    UpdateParticipationRequest,
    ParticipationsByCavalier,
    ParticipationsByCompetition 
} from '../models/Participation';

export class ParticipationService {

    static async inscrireCavalierCompetition(participationData: CreateParticipationRequest): Promise<Participation> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const cavalierCheck = await client.query(
                'SELECT idcavalier FROM cavalier WHERE idcavalier = $1',
                [participationData.idcavalier]
            );
            if (cavalierCheck.rows.length === 0) {
                throw new Error('Cavalier non trouvé');
            }

            const competitionCheck = await client.query(
                'SELECT idcompetition FROM competition WHERE idcompetition = $1',
                [participationData.idcompetition]
            );
            if (competitionCheck.rows.length === 0) {
                throw new Error('Compétition non trouvée');
            }

            const niveauCheck = await client.query(
                'SELECT idniveau FROM niveau WHERE idniveau = $1',
                [participationData.idniveau]
            );
            if (niveauCheck.rows.length === 0) {
                throw new Error('Niveau non trouvé');
            }

            const existingParticipation = await client.query(
                'SELECT idcavalier FROM participer WHERE idcavalier = $1 AND idcompetition = $2',
                [participationData.idcavalier, participationData.idcompetition]
            );
            if (existingParticipation.rows.length > 0) {
                throw new Error('Ce cavalier est déjà inscrit à cette compétition');
            }

            const insertQuery = `
                INSERT INTO participer (idcavalier, idcompetition, idniveau) 
                VALUES ($1, $2, $3) 
                RETURNING idcavalier, idcompetition, idniveau
            `;
            const result = await client.query(insertQuery, [
                participationData.idcavalier,
                participationData.idcompetition,
                participationData.idniveau
            ]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de l\'inscription du cavalier:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async retirerParticipation(idcavalier: number, idcompetition: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const participationCheck = await client.query(
                'SELECT idcavalier FROM participer WHERE idcavalier = $1 AND idcompetition = $2',
                [idcavalier, idcompetition]
            );
            if (participationCheck.rows.length === 0) {
                throw new Error('Participation non trouvée');
            }

            await client.query(
                'DELETE FROM participer WHERE idcavalier = $1 AND idcompetition = $2',
                [idcavalier, idcompetition]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de la participation:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async getParticipationsByCompetition(idcompetition: number): Promise<ParticipationsByCompetition> {
        try {

            const competitionQuery = `
                SELECT c.idcompetition, c.nomcompetition, c.datecompetition
                FROM competition c
                WHERE c.idcompetition = $1
            `;
            const competitionResult = await pool.query(competitionQuery, [idcompetition]);
            
            if (competitionResult.rows.length === 0) {
                throw new Error('Compétition non trouvée');
            }

            const competition = competitionResult.rows[0];

            const participationsQuery = `
                SELECT 
                    p.idcavalier,
                    p.idniveau,
                    cav.nomcavalier,
                    cav.prenomcavalier,
                    cav.numerodossard,
                    cav.idclub,
                    cl.nomclub,
                    n.libelle as libelleniveau
                FROM participer p
                JOIN cavalier cav ON p.idcavalier = cav.idcavalier
                JOIN club cl ON cav.idclub = cl.idclub
                JOIN niveau n ON p.idniveau = n.idniveau
                WHERE p.idcompetition = $1
                ORDER BY cav.nomcavalier ASC, cav.prenomcavalier ASC
            `;
            const participationsResult = await pool.query(participationsQuery, [idcompetition]);

            return {
                idcompetition: competition.idcompetition,
                nomcompetition: competition.nomcompetition,
                datecompetition: competition.datecompetition,
                participations: participationsResult.rows
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des participations par compétition:', error);
            throw error;
        }
    }

    static async getParticipationsByCavalier(idcavalier: number): Promise<ParticipationsByCavalier> {
        try {
            const cavalierQuery = `
                SELECT cav.idcavalier, cav.nomcavalier, cav.prenomcavalier, cav.numerodossard
                FROM cavalier cav
                WHERE cav.idcavalier = $1
            `;
            const cavalierResult = await pool.query(cavalierQuery, [idcavalier]);
            
            if (cavalierResult.rows.length === 0) {
                throw new Error('Cavalier non trouvé');
            }

            const cavalier = cavalierResult.rows[0];

            const participationsQuery = `
                SELECT 
                    p.idcompetition,
                    p.idniveau,
                    c.nomcompetition,
                    c.datecompetition,
                    n.libelle as libelleniveau
                FROM participer p
                JOIN competition c ON p.idcompetition = c.idcompetition
                JOIN niveau n ON p.idniveau = n.idniveau
                WHERE p.idcavalier = $1
                ORDER BY c.datecompetition DESC
            `;
            const participationsResult = await pool.query(participationsQuery, [idcavalier]);

            return {
                idcavalier: cavalier.idcavalier,
                nomcavalier: cavalier.nomcavalier,
                prenomcavalier: cavalier.prenomcavalier,
                numerodossard: cavalier.numerodossard,
                participations: participationsResult.rows
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des participations par cavalier:', error);
            throw error;
        }
    }

    static async changerNiveauParticipation(idcavalier: number, idcompetition: number, nouveauIdNiveau: number): Promise<Participation> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const participationCheck = await client.query(
                'SELECT idcavalier FROM participer WHERE idcavalier = $1 AND idcompetition = $2',
                [idcavalier, idcompetition]
            );
            if (participationCheck.rows.length === 0) {
                throw new Error('Participation non trouvée');
            }

            const niveauCheck = await client.query(
                'SELECT idniveau FROM niveau WHERE idniveau = $1',
                [nouveauIdNiveau]
            );
            if (niveauCheck.rows.length === 0) {
                throw new Error('Nouveau niveau non trouvé');
            }

            const updateQuery = `
                UPDATE participer 
                SET idniveau = $1
                WHERE idcavalier = $2 AND idcompetition = $3
                RETURNING idcavalier, idcompetition, idniveau
            `;
            const result = await client.query(updateQuery, [
                nouveauIdNiveau,
                idcavalier,
                idcompetition
            ]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors du changement de niveau:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async getParticipationComplete(idcavalier: number, idcompetition: number): Promise<ParticipationComplete> {
        try {
            const query = `
                SELECT 
                    p.idcavalier,
                    p.idcompetition,
                    p.idniveau,
                    cav.nomcavalier,
                    cav.prenomcavalier,
                    cav.numerodossard,
                    cav.idclub,
                    cl.nomclub,
                    c.nomcompetition,
                    c.datecompetition,
                    n.libelle as libelleniveau,
                    n.description as descriptionniveau
                FROM participer p
                JOIN cavalier cav ON p.idcavalier = cav.idcavalier
                JOIN club cl ON cav.idclub = cl.idclub
                JOIN competition c ON p.idcompetition = c.idcompetition
                JOIN niveau n ON p.idniveau = n.idniveau
                WHERE p.idcavalier = $1 AND p.idcompetition = $2
            `;
            const result = await pool.query(query, [idcavalier, idcompetition]);

            if (result.rows.length === 0) {
                throw new Error('Participation non trouvée');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération de la participation complète:', error);
            throw error;
        }
    }

    static async getAllParticipations(): Promise<ParticipationComplete[]> {
        try {
            const query = `
                SELECT 
                    p.idcavalier,
                    p.idcompetition,
                    p.idniveau,
                    cav.nomcavalier,
                    cav.prenomcavalier,
                    cav.numerodossard,
                    cav.idclub,
                    cl.nomclub,
                    c.nomcompetition,
                    c.datecompetition,
                    n.libelle as libelleniveau,
                    n.description as descriptionniveau
                FROM participer p
                JOIN cavalier cav ON p.idcavalier = cav.idcavalier
                JOIN club cl ON cav.idclub = cl.idclub
                JOIN competition c ON p.idcompetition = c.idcompetition
                JOIN niveau n ON p.idniveau = n.idniveau
                ORDER BY c.datecompetition DESC, cav.nomcavalier ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération de toutes les participations:', error);
            throw new Error('Erreur lors de la récupération des participations');
        }
    }
}