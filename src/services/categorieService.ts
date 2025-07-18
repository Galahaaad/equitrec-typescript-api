import { pool } from '../config/database';
import { Categorie, CreateCategorieRequest, UpdateCategorieRequest, CreateCategorieResponse } from '../models/Categorie';
import { CategorieWithFiches, FicheInCategorie } from '../models/FicheCategorie';

export class CategorieService {

    static async getAllCategories(): Promise<Categorie[]> {
        try {
            const query = `
                SELECT idcategorie, libelle, notefinal
                FROM categorie
                ORDER BY libelle ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw new Error('Erreur lors de la récupération des catégories');
        }
    }

    static async getCategorieById(id: number): Promise<Categorie> {
        try {
            const query = `
                SELECT idcategorie, libelle, notefinal
                FROM categorie
                WHERE idcategorie = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Catégorie non trouvée');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie:', error);
            throw error;
        }
    }

    static async createCategorie(categorieData: CreateCategorieRequest): Promise<CreateCategorieResponse> {
        try {
            if (!categorieData.libelle || categorieData.libelle.trim().length === 0) {
                throw new Error('Le libellé est requis');
            }

            if (categorieData.notefinal === null || categorieData.notefinal === undefined) {
                throw new Error('La note finale est requise');
            }

            if (categorieData.libelle.trim().length > 50) {
                throw new Error('Le libellé ne peut pas dépasser 50 caractères');
            }

            if (categorieData.notefinal < 0 || categorieData.notefinal > 20) {
                throw new Error('La note finale doit être comprise entre 0 et 20');
            }

            const libelleTrimmed = categorieData.libelle.trim();

            const checkQuery = 'SELECT idcategorie FROM categorie WHERE LOWER(libelle) = LOWER($1)';
            const checkResult = await pool.query(checkQuery, [libelleTrimmed]);
            if (checkResult.rows.length > 0) {
                throw new Error('Une catégorie avec ce libellé existe déjà');
            }

            const insertQuery = `
                INSERT INTO categorie (libelle, notefinal) 
                VALUES ($1, $2) 
                RETURNING idcategorie, libelle, notefinal
            `;
            const insertResult = await pool.query(insertQuery, [
                libelleTrimmed,
                categorieData.notefinal
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création de la catégorie:', error);
            throw error;
        }
    }

    static async updateCategorie(id: number, categorieData: UpdateCategorieRequest): Promise<Categorie> {
        try {
            const existingCategorie = await this.getCategorieById(id);

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (categorieData.libelle !== undefined) {
                const libelleTrimmed = categorieData.libelle.trim();
                if (libelleTrimmed.length === 0 || libelleTrimmed.length > 50) {
                    throw new Error('Le libellé doit contenir entre 1 et 50 caractères');
                }

                const checkQuery = 'SELECT idcategorie FROM categorie WHERE LOWER(libelle) = LOWER($1) AND idcategorie != $2';
                const checkResult = await pool.query(checkQuery, [libelleTrimmed, id]);
                if (checkResult.rows.length > 0) {
                    throw new Error('Une catégorie avec ce libellé existe déjà');
                }

                updateFields.push(`libelle = $${paramIndex}`);
                values.push(libelleTrimmed);
                paramIndex++;
            }

            if (categorieData.notefinal !== undefined) {
                if (categorieData.notefinal < 0 || categorieData.notefinal > 20) {
                    throw new Error('La note finale doit être comprise entre 0 et 20');
                }
                updateFields.push(`notefinal = $${paramIndex}`);
                values.push(categorieData.notefinal);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
                UPDATE categorie 
                SET ${updateFields.join(', ')} 
                WHERE idcategorie = $${paramIndex}
                RETURNING idcategorie, libelle, notefinal
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Catégorie non trouvée');
            }

            return updateResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la catégorie:', error);
            throw error;
        }
    }

    static async deleteCategorie(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.getCategorieById(id);

            await client.query('DELETE FROM contenir WHERE idcategorie = $1', [id]);

            await client.query('DELETE FROM categorie WHERE idcategorie = $1', [id]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de la catégorie:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async getCategorieWithFiches(id: number): Promise<CategorieWithFiches> {
        try {
            const categorie = await this.getCategorieById(id);
            const fichesQuery = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, 
                       cl.nomclub, e.titre
                FROM contenir cont
                JOIN fichenotation fn ON cont.idfichenotation = fn.idfichenotation
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                WHERE cont.idcategorie = $1
                ORDER BY fn.idfichenotation ASC
            `;
            
            const fichesResult = await pool.query(fichesQuery, [id]);
            const fiches: FicheInCategorie[] = fichesResult.rows;

            return {
                idcategorie: categorie.idcategorie,
                libelle: categorie.libelle,
                notefinal: categorie.notefinal,
                fiches
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie avec fiches:', error);
            throw error;
        }
    }

    static async getFichesByCategorie(categorieId: number): Promise<FicheInCategorie[]> {
        try {
            await this.getCategorieById(categorieId);

            const query = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, 
                       cl.nomclub, e.titre
                FROM contenir cont
                JOIN fichenotation fn ON cont.idfichenotation = fn.idfichenotation
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                WHERE cont.idcategorie = $1
                ORDER BY fn.idfichenotation ASC
            `;
            
            const result = await pool.query(query, [categorieId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches par catégorie:', error);
            throw error;
        }
    }

    static async assignFicheToCategorie(categorieId: number, ficheId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await this.getCategorieById(categorieId);

            const ficheQuery = 'SELECT idfichenotation FROM fichenotation WHERE idfichenotation = $1';
            const ficheResult = await client.query(ficheQuery, [ficheId]);
            
            if (ficheResult.rows.length === 0) {
                throw new Error('La fiche de notation spécifiée n\'existe pas');
            }

            const existingQuery = 'SELECT 1 FROM contenir WHERE idfichenotation = $1 AND idcategorie = $2';
            const existingResult = await client.query(existingQuery, [ficheId, categorieId]);
            
            if (existingResult.rows.length > 0) {
                throw new Error('Cette fiche de notation est déjà assignée à cette catégorie');
            }

            const insertQuery = 'INSERT INTO contenir (idfichenotation, idcategorie) VALUES ($1, $2)';
            await client.query(insertQuery, [ficheId, categorieId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de l\'assignation de la fiche:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}