import { pool } from '../config/database';
import { FicheNotation, CreateFicheNotationRequest, UpdateFicheNotationRequest, CreateFicheNotationResponse } from '../models/FicheNotation';
import { FicheNotationWithCategories, CategorieInFiche } from '../models/FicheCategorie';

export class FicheNotationService {

    static async getAllFichesNotation(): Promise<FicheNotation[]> {
        try {
            const query = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, cl.nomclub,
                       e.titre
                FROM fichenotation fn
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                ORDER BY fn.idfichenotation ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation:', error);
            throw new Error('Erreur lors de la récupération des fiches de notation');
        }
    }

    static async getFicheNotationById(id: number): Promise<FicheNotation> {
        try {
            const query = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, cl.nomclub,
                       e.titre
                FROM fichenotation fn
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                WHERE fn.idfichenotation = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Fiche de notation non trouvée');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération de la fiche de notation:', error);
            throw error;
        }
    }

    static async getFichesNotationByCavalier(cavalierId: number): Promise<FicheNotation[]> {
        try {
            const query = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, cl.nomclub,
                       e.titre
                FROM fichenotation fn
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                WHERE fn.idcavalier = $1
                ORDER BY fn.idfichenotation ASC
            `;
            const result = await pool.query(query, [cavalierId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation du cavalier:', error);
            throw new Error('Erreur lors de la récupération des fiches de notation du cavalier');
        }
    }

    static async getFichesNotationByEpreuve(epreuveId: number): Promise<FicheNotation[]> {
        try {
            const query = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, cl.nomclub,
                       e.titre
                FROM fichenotation fn
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                WHERE fn.idepreuve = $1
                ORDER BY fn.idfichenotation ASC
            `;
            const result = await pool.query(query, [epreuveId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation de l\'épreuve:', error);
            throw new Error('Erreur lors de la récupération des fiches de notation de l\'épreuve');
        }
    }

    static async getFichesNotationByCavalierAndCompetition(cavalierId: number, competitionId: number): Promise<FicheNotation[]> {
        try {
            const query = `
                SELECT fn.idfichenotation, fn.cumulenote, fn.appreciation, fn.isvalidate, 
                       fn.idcavalier, fn.idepreuve, c.nomcavalier, c.prenomcavalier, cl.nomclub,
                       e.titre, comp.nomcompetition
                FROM fichenotation fn
                LEFT JOIN cavalier c ON fn.idcavalier = c.idcavalier
                LEFT JOIN club cl ON c.idclub = cl.idclub
                LEFT JOIN epreuve e ON fn.idepreuve = e.idepreuve
                LEFT JOIN composer com ON e.idepreuve = com.idepreuve
                LEFT JOIN competition comp ON com.idcompetition = comp.idcompetition
                LEFT JOIN participer p ON p.idcavalier = fn.idcavalier AND p.idcompetition = comp.idcompetition
                WHERE fn.idcavalier = $1 AND comp.idcompetition = $2
                ORDER BY fn.idfichenotation ASC
            `;
            const result = await pool.query(query, [cavalierId, competitionId]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches de notation du cavalier pour la compétition:', error);
            throw new Error('Erreur lors de la récupération des fiches de notation du cavalier pour la compétition');
        }
    }

    static async createFicheNotation(ficheData: CreateFicheNotationRequest): Promise<CreateFicheNotationResponse> {
        try {
            if (!ficheData.cumulenote && ficheData.cumulenote !== 0) {
                throw new Error('Le cumul de note est requis');
            }

            if (!ficheData.appreciation || ficheData.appreciation.trim().length === 0) {
                throw new Error('L\'appréciation est requise');
            }

            if (!ficheData.idcavalier) {
                throw new Error('Le cavalier est requis');
            }

            if (!ficheData.idepreuve) {
                throw new Error('L\'épreuve est requise');
            }

            if (ficheData.appreciation.trim().length > 500) {
                throw new Error('L\'appréciation ne peut pas dépasser 500 caractères');
            }

            const appreciationTrimmed = ficheData.appreciation.trim();

            const cavalierCheckQuery = 'SELECT idcavalier FROM cavalier WHERE idcavalier = $1';
            const cavalierCheckResult = await pool.query(cavalierCheckQuery, [ficheData.idcavalier]);
            if (cavalierCheckResult.rows.length === 0) {
                throw new Error('Le cavalier spécifié n\'existe pas');
            }

            const epreuveCheckQuery = 'SELECT idepreuve FROM epreuve WHERE idepreuve = $1';
            const epreuveCheckResult = await pool.query(epreuveCheckQuery, [ficheData.idepreuve]);
            if (epreuveCheckResult.rows.length === 0) {
                throw new Error('L\'épreuve spécifiée n\'existe pas');
            }

            const insertQuery = `
                INSERT INTO fichenotation (cumulenote, appreciation, isvalidate, idcavalier, idepreuve) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING idfichenotation, cumulenote, appreciation, isvalidate, idcavalier, idepreuve
            `;
            const insertResult = await pool.query(insertQuery, [
                ficheData.cumulenote,
                appreciationTrimmed,
                ficheData.isvalidate || false,
                ficheData.idcavalier,
                ficheData.idepreuve
            ]);

            return insertResult.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création de la fiche de notation:', error);
            throw error;
        }
    }

    static async updateFicheNotation(id: number, ficheData: UpdateFicheNotationRequest): Promise<FicheNotation> {
        try {
            const existingFiche = await this.getFicheNotationById(id);

            if (ficheData.idcavalier !== undefined) {
                const cavalierQuery = 'SELECT idcavalier FROM cavalier WHERE idcavalier = $1';
                const cavalierResult = await pool.query(cavalierQuery, [ficheData.idcavalier]);

                if (cavalierResult.rows.length === 0) {
                    throw new Error('Le cavalier spécifié n\'existe pas');
                }
            }

            if (ficheData.idepreuve !== undefined) {
                const epreuveQuery = 'SELECT idepreuve FROM epreuve WHERE idepreuve = $1';
                const epreuveResult = await pool.query(epreuveQuery, [ficheData.idepreuve]);

                if (epreuveResult.rows.length === 0) {
                    throw new Error('L\'épreuve spécifiée n\'existe pas');
                }
            }

            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (ficheData.cumulenote !== undefined) {
                updateFields.push(`cumulenote = $${paramIndex}`);
                values.push(ficheData.cumulenote);
                paramIndex++;
            }

            if (ficheData.appreciation !== undefined) {
                const appreciationTrimmed = ficheData.appreciation.trim();
                if (appreciationTrimmed.length === 0 || appreciationTrimmed.length > 500) {
                    throw new Error('L\'appréciation doit contenir entre 1 et 500 caractères');
                }
                updateFields.push(`appreciation = $${paramIndex}`);
                values.push(appreciationTrimmed);
                paramIndex++;
            }

            if (ficheData.isvalidate !== undefined) {
                updateFields.push(`isvalidate = $${paramIndex}`);
                values.push(ficheData.isvalidate);
                paramIndex++;
            }

            if (ficheData.idcavalier !== undefined) {
                updateFields.push(`idcavalier = $${paramIndex}`);
                values.push(ficheData.idcavalier);
                paramIndex++;
            }

            if (ficheData.idepreuve !== undefined) {
                updateFields.push(`idepreuve = $${paramIndex}`);
                values.push(ficheData.idepreuve);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);
            const updateQuery = `
                UPDATE fichenotation 
                SET ${updateFields.join(', ')} 
                WHERE idfichenotation = $${paramIndex}
                RETURNING idfichenotation, cumulenote, appreciation, isvalidate, idcavalier, idepreuve
            `;

            const updateResult = await pool.query(updateQuery, values);

            if (updateResult.rows.length === 0) {
                throw new Error('Fiche de notation non trouvée');
            }

            return await this.getFicheNotationById(id);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la fiche de notation:', error);
            throw error;
        }
    }

    static async deleteFicheNotation(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await this.getFicheNotationById(id);
            await client.query('DELETE FROM contenir WHERE idfichenotation = $1', [id]);
            await client.query('DELETE FROM fichenotation WHERE idfichenotation = $1', [id]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de la fiche de notation:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteFichesNotationByCompetitionAndEpreuve(competitionId: number, epreuveId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Vérifier que la relation composer existe
            const composerCheckQuery = 'SELECT 1 FROM composer WHERE idcompetition = $1 AND idepreuve = $2';
            const composerCheckResult = await client.query(composerCheckQuery, [competitionId, epreuveId]);
            if (composerCheckResult.rows.length === 0) {
                throw new Error('Relation competition-epreuve non trouvée dans la table composer');
            }

            // Récupérer toutes les fiches de notation pour cette épreuve
            const ficheIdsQuery = 'SELECT idfichenotation FROM fichenotation WHERE idepreuve = $1';
            const ficheIdsResult = await client.query(ficheIdsQuery, [epreuveId]);
            const ficheIds = ficheIdsResult.rows.map(row => row.idfichenotation);

            if (ficheIds.length > 0) {
                // Supprimer les relations dans la table contenir
                const deleteContenirQuery = 'DELETE FROM contenir WHERE idfichenotation = ANY($1)';
                await client.query(deleteContenirQuery, [ficheIds]);

                // Supprimer les fiches de notation
                const deleteFichesQuery = 'DELETE FROM fichenotation WHERE idepreuve = $1';
                await client.query(deleteFichesQuery, [epreuveId]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression des fiches de notation par compétition et épreuve:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteFichesNotationByCompetition(competitionId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Récupérer toutes les épreuves de cette compétition
            const epreuvesQuery = 'SELECT idepreuve FROM composer WHERE idcompetition = $1';
            const epreuvesResult = await client.query(epreuvesQuery, [competitionId]);
            const epreuveIds = epreuvesResult.rows.map(row => row.idepreuve);

            if (epreuveIds.length > 0) {
                // Récupérer toutes les fiches de notation pour ces épreuves
                const ficheIdsQuery = 'SELECT idfichenotation FROM fichenotation WHERE idepreuve = ANY($1)';
                const ficheIdsResult = await client.query(ficheIdsQuery, [epreuveIds]);
                const ficheIds = ficheIdsResult.rows.map(row => row.idfichenotation);

                if (ficheIds.length > 0) {
                    // Supprimer les relations dans la table contenir
                    const deleteContenirQuery = 'DELETE FROM contenir WHERE idfichenotation = ANY($1)';
                    await client.query(deleteContenirQuery, [ficheIds]);

                    // Supprimer les fiches de notation
                    const deleteFichesQuery = 'DELETE FROM fichenotation WHERE idepreuve = ANY($1)';
                    await client.query(deleteFichesQuery, [epreuveIds]);
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression des fiches de notation par compétition:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async getFicheNotationWithCategories(id: number): Promise<FicheNotationWithCategories> {
        try {
            const fiche = await this.getFicheNotationById(id);

            const categoriesQuery = `
                SELECT c.idcategorie, c.libelle, c.notefinal
                FROM contenir cont
                JOIN categorie c ON cont.idcategorie = c.idcategorie
                WHERE cont.idfichenotation = $1
                ORDER BY c.libelle ASC
            `;
            
            const categoriesResult = await pool.query(categoriesQuery, [id]);
            const categories: CategorieInFiche[] = categoriesResult.rows;

            return {
                idfichenotation: fiche.idfichenotation,
                cumulenote: fiche.cumulenote,
                appreciation: fiche.appreciation,
                isvalidate: fiche.isvalidate,
                idcavalier: fiche.idcavalier,
                idepreuve: fiche.idepreuve,
                nomcavalier: fiche.nomcavalier,
                prenomcavalier: fiche.prenomcavalier,
                nomclub: fiche.nomclub,
                titre: fiche.titre,
                categories
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la fiche avec catégories:', error);
            throw error;
        }
    }

    static async assignCategorieToFiche(ficheId: number, categorieId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await this.getFicheNotationById(ficheId);

            const categorieQuery = 'SELECT idcategorie FROM categorie WHERE idcategorie = $1';
            const categorieResult = await client.query(categorieQuery, [categorieId]);
            
            if (categorieResult.rows.length === 0) {
                throw new Error('La catégorie spécifiée n\'existe pas');
            }

            const existingQuery = 'SELECT 1 FROM contenir WHERE idfichenotation = $1 AND idcategorie = $2';
            const existingResult = await client.query(existingQuery, [ficheId, categorieId]);
            
            if (existingResult.rows.length > 0) {
                throw new Error('Cette catégorie est déjà assignée à cette fiche de notation');
            }

            const insertQuery = 'INSERT INTO contenir (idfichenotation, idcategorie) VALUES ($1, $2)';
            await client.query(insertQuery, [ficheId, categorieId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de l\'assignation de la catégorie:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async removeCategorieFromFiche(ficheId: number, categorieId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await this.getFicheNotationById(ficheId);

            const existingQuery = 'SELECT 1 FROM contenir WHERE idfichenotation = $1 AND idcategorie = $2';
            const existingResult = await client.query(existingQuery, [ficheId, categorieId]);
            
            if (existingResult.rows.length === 0) {
                throw new Error('Cette catégorie n\'est pas assignée à cette fiche de notation');
            }

            const deleteQuery = 'DELETE FROM contenir WHERE idfichenotation = $1 AND idcategorie = $2';
            await client.query(deleteQuery, [ficheId, categorieId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la suppression de la catégorie:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
