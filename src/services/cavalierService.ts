import { pool } from '../config/database';
import { Cavalier, CreateCavalierRequest, UpdateCavalierRequest, CreateCavalierResponse } from '../models/Cavalier';

export class CavalierService {

    static async getAllCavaliers(): Promise<Cavalier[]> {
        try {
            const query = `
                SELECT c.idcavalier, c.nomcavalier, c.prenomcavalier, c.datenaissance, 
                       c.numerodossard, c.idclub, cl.nomclub 
                FROM cavalier c
                LEFT JOIN club cl ON c.idclub = cl.idclub
                ORDER BY c.nomcavalier ASC, c.prenomcavalier ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des cavaliers:', error);
            throw new Error('Erreur lors de la récupération des cavaliers');
        }
    }

    static async getCavalierById(id: number): Promise<Cavalier> {
        try {
            const query = `
                SELECT c.idcavalier, c.nomcavalier, c.prenomcavalier, c.datenaissance, 
                       c.numerodossard, c.idclub, cl.nomclub 
                FROM cavalier c
                LEFT JOIN club cl ON c.idclub = cl.idclub
                WHERE c.idcavalier = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Cavalier non trouvé');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du cavalier:', error);
            throw error;
        }
    }

    static async getCavaliersByClub(clubId: number): Promise<Cavalier[]> {
        try {
            const query = `
                SELECT c.idcavalier, c.nomcavalier, c.prenomcavalier, c.datenaissance, 
                       c.numerodossard, c.idclub, cl.nomclub 
                FROM cavalier c
                LEFT JOIN club cl ON c.idclub = cl.idclub
                WHERE c.idclub = $1
                ORDER BY c.nomcavalier ASC, c.prenomcavalier ASC
            `;
            const result = await pool.query(query, [clubId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des cavaliers du club:', error);
            throw new Error('Erreur lors de la récupération des cavaliers du club');
        }
    }

    static async createCavalier(cavalierData: CreateCavalierRequest): Promise<CreateCavalierResponse> {
        try {
            if (!cavalierData.nomcavalier || cavalierData.nomcavalier.trim().length === 0) {
                throw new Error('Le nom du cavalier est requis');
            }

            if (!cavalierData.prenomcavalier || cavalierData.prenomcavalier.trim().length === 0) {
                throw new Error('Le prénom du cavalier est requis');
            }

            if (!cavalierData.datenaissance) {
                throw new Error('La date de naissance est requise');
            }

            if (!cavalierData.numerodossard) {
                throw new Error('Le numéro de dossard est requis');
            }

            if (!cavalierData.idclub) {
                throw new Error('Le club est requis');
            }

            if (cavalierData.nomcavalier.trim().length > 100) {
                throw new Error('Le nom du cavalier ne peut pas dépasser 100 caractères');
            }

            if (cavalierData.prenomcavalier.trim().length > 100) {
                throw new Error('Le prénom du cavalier ne peut pas dépasser 100 caractères');
            }

            const nomCavalierTrimmed = cavalierData.nomcavalier.trim();
            const prenomCavalierTrimmed = cavalierData.prenomcavalier.trim();

            const clubCheckQuery = 'SELECT idclub FROM club WHERE idclub = $1';
            const clubCheckResult = await pool.query(clubCheckQuery, [cavalierData.idclub]);
            if (clubCheckResult.rows.length === 0) {
                throw new Error('Le club spécifié n\'existe pas');
            }

            const dossardCheckQuery = 'SELECT idcavalier FROM cavalier WHERE numerodossard = $1';
            const dossardCheckResult = await pool.query(dossardCheckQuery, [cavalierData.numerodossard]);
            if (dossardCheckResult.rows.length > 0) {
                throw new Error('Ce numéro de dossard est déjà utilisé');
            }

            const insertQuery = `
                INSERT INTO cavalier (nomcavalier, prenomcavalier, datenaissance, numerodossard, idclub) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING idcavalier, nomcavalier, prenomcavalier, datenaissance, numerodossard, idclub
            `;
            const insertResult = await pool.query(insertQuery, [
                nomCavalierTrimmed,
                prenomCavalierTrimmed,
                cavalierData.datenaissance,
                cavalierData.numerodossard,
                cavalierData.idclub
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du cavalier:', error);
            throw error;
        }
    }

    static async updateCavalier(id: number, cavalierData: UpdateCavalierRequest): Promise<Cavalier> {
        try {
            const existingCavalier = await this.getCavalierById(id);

            if (cavalierData.numerodossard !== undefined) {
                if (cavalierData.numerodossard !== existingCavalier.numerodossard) {
                    const dossardQuery = 'SELECT idcavalier FROM cavalier WHERE numerodossard = $1';
                    const dossardResult = await pool.query(dossardQuery, [cavalierData.numerodossard]);

                    if (dossardResult.rows.length > 0) {
                        throw new Error('Ce numéro de dossard est déjà utilisé');
                    }
                }
            }

            if (cavalierData.idclub !== undefined) {
                const clubQuery = 'SELECT idclub FROM club WHERE idclub = $1';
                const clubResult = await pool.query(clubQuery, [cavalierData.idclub]);

                if (clubResult.rows.length === 0) {
                    throw new Error('Le club spécifié n\'existe pas');
                }
            }

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (cavalierData.nomcavalier !== undefined) {
                const nomTrimmed = cavalierData.nomcavalier.trim();
                if (nomTrimmed.length === 0 || nomTrimmed.length > 100) {
                    throw new Error('Le nom du cavalier doit contenir entre 1 et 100 caractères');
                }
                updateFields.push(`nomcavalier = $${paramIndex}`);
                values.push(nomTrimmed);
                paramIndex++;
            }

            if (cavalierData.prenomcavalier !== undefined) {
                const prenomTrimmed = cavalierData.prenomcavalier.trim();
                if (prenomTrimmed.length === 0 || prenomTrimmed.length > 100) {
                    throw new Error('Le prénom du cavalier doit contenir entre 1 et 100 caractères');
                }
                updateFields.push(`prenomcavalier = $${paramIndex}`);
                values.push(prenomTrimmed);
                paramIndex++;
            }

            if (cavalierData.datenaissance !== undefined) {
                const dateNaissance = new Date(cavalierData.datenaissance);
                if (isNaN(dateNaissance.getTime())) {
                    throw new Error('Format de date invalide');
                }
                updateFields.push(`datenaissance = $${paramIndex}`);
                values.push(dateNaissance);
                paramIndex++;
            }

            if (cavalierData.numerodossard !== undefined) {
                updateFields.push(`numerodossard = $${paramIndex}`);
                values.push(cavalierData.numerodossard);
                paramIndex++;
            }

            if (cavalierData.idclub !== undefined) {
                updateFields.push(`idclub = $${paramIndex}`);
                values.push(cavalierData.idclub);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
            UPDATE cavalier 
            SET ${updateFields.join(', ')} 
            WHERE idcavalier = $${paramIndex}
            RETURNING idcavalier, nomcavalier, prenomcavalier, datenaissance, numerodossard, idclub
        `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Cavalier non trouvé');
            }

            return await this.getCavalierById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du cavalier:', error);
            throw error;
        }
    }

    static async deleteCavalier(id: number): Promise<void> {
        try {
            await this.getCavalierById(id);

            const deleteQuery = 'DELETE FROM cavalier WHERE idcavalier = $1';
            await pool.query(deleteQuery, [id]);
        } catch (error) {
            console.error('Erreur lors de la suppression du cavalier:', error);
            throw error;
        }
    }
}
