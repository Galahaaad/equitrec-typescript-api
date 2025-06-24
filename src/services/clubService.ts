import { pool } from '../config/database';
import { Club } from '../models/Club';

export class ClubService {

    static async getAllClubs(): Promise<Club[]> {
        try {
            const query = 'SELECT idclub, nomclub FROM club ORDER BY nomclub ASC';
            const result = await pool.query(query);

            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des clubs:', error);
            throw new Error('Erreur lors de la récupération des clubs');
        }
    }

    static async getClubById(id: number): Promise<Club> {
        try {
            const query = 'SELECT idclub, nomclub FROM club WHERE idclub = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Club non trouvé');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du club:', error);
            throw error;
        }
    }
}
