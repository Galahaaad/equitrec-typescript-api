import { CategorieService } from '../../src/services/categorieService';

// Mock de la base de données
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
    pool: {
        query: mockQuery,
        connect: jest.fn(() => ({
            query: mockQuery,
            release: jest.fn()
        }))
    }
}));

describe('CategorieService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCategories', () => {
        it('should return all categories', async () => {
            const mockCategories = [
                { idcategorie: 1, libelle: 'Allures', notefinal: 10 },
                { idcategorie: 2, libelle: 'Présentation', notefinal: 15 }
            ];
            mockQuery.mockResolvedValue({ rows: mockCategories });

            const result = await CategorieService.getAllCategories();

            expect(result).toEqual(mockCategories);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT idcategorie, libelle, notefinal FROM categorie')
            );
        });

        it('should throw error on database failure', async () => {
            mockQuery.mockRejectedValue(new Error('Database error'));

            await expect(CategorieService.getAllCategories()).rejects.toThrow('Erreur lors de la récupération des catégories');
        });
    });

    describe('getCategorieById', () => {
        it('should return categorie by id', async () => {
            const mockCategorie = { idcategorie: 1, libelle: 'Allures', notefinal: 10 };
            mockQuery.mockResolvedValue({ rows: [mockCategorie] });

            const result = await CategorieService.getCategorieById(1);

            expect(result).toEqual(mockCategorie);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE idcategorie = $1'),
                [1]
            );
        });

        it('should throw error when categorie not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CategorieService.getCategorieById(999)).rejects.toThrow('Catégorie non trouvée');
        });
    });

    describe('createCategorie', () => {
        it('should create categorie successfully', async () => {
            const categorieData = { libelle: 'Saut', notefinal: 12 };
            const mockCreatedCategorie = { idcategorie: 3, ...categorieData };

            // Mock pour vérifier l'unicité (aucune catégorie existante)
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour l'insertion
            mockQuery.mockResolvedValueOnce({ rows: [mockCreatedCategorie] });

            const result = await CategorieService.createCategorie(categorieData);

            expect(result).toEqual(mockCreatedCategorie);
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });

        it('should throw error for duplicate libelle', async () => {
            const categorieData = { libelle: 'Allures', notefinal: 10 };
            
            // Mock pour vérifier l'unicité (catégorie existante trouvée)
            mockQuery.mockResolvedValue({ rows: [{ idcategorie: 1 }] });

            await expect(CategorieService.createCategorie(categorieData)).rejects.toThrow('Une catégorie avec ce libellé existe déjà');
        });

        it('should throw error for empty libelle', async () => {
            const categorieData = { libelle: '', notefinal: 10 };

            await expect(CategorieService.createCategorie(categorieData)).rejects.toThrow('Le libellé est requis');
        });

        it('should throw error for missing notefinal', async () => {
            const categorieData = { libelle: 'Test', notefinal: null as any };

            await expect(CategorieService.createCategorie(categorieData)).rejects.toThrow('La note finale est requise');
        });

        it('should throw error for invalid notefinal range', async () => {
            const categorieData = { libelle: 'Test', notefinal: 25 };

            await expect(CategorieService.createCategorie(categorieData)).rejects.toThrow('La note finale doit être comprise entre 0 et 20');
        });

        it('should throw error for negative notefinal', async () => {
            const categorieData = { libelle: 'Test', notefinal: -5 };

            await expect(CategorieService.createCategorie(categorieData)).rejects.toThrow('La note finale doit être comprise entre 0 et 20');
        });
    });

    describe('updateCategorie', () => {
        it('should update categorie successfully', async () => {
            const updateData = { libelle: 'Allures+', notefinal: 12 };
            const existingCategorie = { idcategorie: 1, libelle: 'Allures', notefinal: 10 };
            const updatedCategorie = { idcategorie: 1, ...updateData };

            // Mock pour getCategorieById
            mockQuery.mockResolvedValueOnce({ rows: [existingCategorie] });
            // Mock pour vérifier l'unicité du libelle
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour l'update
            mockQuery.mockResolvedValueOnce({ rows: [updatedCategorie] });

            const result = await CategorieService.updateCategorie(1, updateData);

            expect(result).toEqual(updatedCategorie);
        });

        it('should throw error when categorie not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CategorieService.updateCategorie(999, { libelle: 'Test' })).rejects.toThrow('Catégorie non trouvée');
        });

        it('should throw error for invalid notefinal in update', async () => {
            const existingCategorie = { idcategorie: 1, libelle: 'Allures', notefinal: 10 };
            mockQuery.mockResolvedValueOnce({ rows: [existingCategorie] });

            await expect(CategorieService.updateCategorie(1, { notefinal: 25 })).rejects.toThrow('La note finale doit être comprise entre 0 et 20');
        });
    });

    describe('deleteCategorie', () => {
        it('should delete categorie successfully', async () => {
            const existingCategorie = { idcategorie: 1, libelle: 'Allures', notefinal: 10 };
            
            // Mock pour getCategorieById
            mockQuery.mockResolvedValueOnce({ rows: [existingCategorie] });
            // Mock pour les opérations de suppression en transaction
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CategorieService.deleteCategorie(1)).resolves.not.toThrow();
        });
    });
});