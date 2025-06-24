import { pool } from '../config/database';
import { Club, CreateClubResponse, CreateClubRequest } from '../models/Club';

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

    static async createClub(clubData: CreateClubRequest): Promise<CreateClubResponse> {
        try {
            if (!clubData.nomclub || clubData.nomclub.trim().length === 0) {
                throw new Error('Le nom du club est requis');
            }

            if (clubData.nomclub.trim().length > 100) {
                throw new Error('Le nom du club ne peut pas dépasser 100 caractères');
            }

            const nomClubTrimmed = clubData.nomclub.trim();

            const checkQuery = 'SELECT idclub FROM club WHERE LOWER(nomclub) = LOWER($1)';
            const checkResult = await pool.query(checkQuery, [nomClubTrimmed]);

            if (checkResult.rows.length > 0) {
                throw new Error('Un club avec ce nom existe déjà');
            }

            const insertQuery = 'INSERT INTO club (nomclub) VALUES ($1) RETURNING idclub, nomclub';
            const insertResult = await pool.query(insertQuery, [nomClubTrimmed]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du club:', error);
            throw error;
        }
    }
}
