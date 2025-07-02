import { NiveauService } from '../../src/services/niveauService';

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

describe('NiveauService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllNiveaux', () => {
        it('should return all niveaux', async () => {
            const mockNiveaux = [
                { idniveau: 1, libelle: 'Débutant', description: 'Niveau débutant' },
                { idniveau: 2, libelle: 'Intermédiaire', description: 'Niveau intermédiaire' }
            ];
            mockQuery.mockResolvedValue({ rows: mockNiveaux });

            const result = await NiveauService.getAllNiveaux();

            expect(result).toEqual(mockNiveaux);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT idniveau, libelle, description FROM niveau')
            );
        });

        it('should throw error on database failure', async () => {
            mockQuery.mockRejectedValue(new Error('Database error'));

            await expect(NiveauService.getAllNiveaux()).rejects.toThrow('Erreur lors de la récupération des niveaux');
        });
    });

    describe('getNiveauById', () => {
        it('should return niveau by id', async () => {
            const mockNiveau = { idniveau: 1, libelle: 'Débutant', description: 'Niveau débutant' };
            mockQuery.mockResolvedValue({ rows: [mockNiveau] });

            const result = await NiveauService.getNiveauById(1);

            expect(result).toEqual(mockNiveau);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE idniveau = $1'),
                [1]
            );
        });

        it('should throw error when niveau not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(NiveauService.getNiveauById(999)).rejects.toThrow('Niveau non trouvé');
        });
    });

    describe('createNiveau', () => {
        it('should create niveau successfully', async () => {
            const niveauData = { libelle: 'Expert', description: 'Niveau expert' };
            const mockCreatedNiveau = { idniveau: 3, ...niveauData };

            // Mock pour vérifier l'unicité (aucun niveau existant)
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour l'insertion
            mockQuery.mockResolvedValueOnce({ rows: [mockCreatedNiveau] });

            const result = await NiveauService.createNiveau(niveauData);

            expect(result).toEqual(mockCreatedNiveau);
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });

        it('should throw error for duplicate libelle', async () => {
            const niveauData = { libelle: 'Débutant', description: 'Niveau débutant' };
            
            // Mock pour vérifier l'unicité (niveau existant trouvé)
            mockQuery.mockResolvedValue({ rows: [{ idniveau: 1 }] });

            await expect(NiveauService.createNiveau(niveauData)).rejects.toThrow('Un niveau avec ce libellé existe déjà');
        });

        it('should throw error for empty libelle', async () => {
            const niveauData = { libelle: '', description: 'Description' };

            await expect(NiveauService.createNiveau(niveauData)).rejects.toThrow('Le libellé est requis');
        });

        it('should throw error for empty description', async () => {
            const niveauData = { libelle: 'Test', description: '' };

            await expect(NiveauService.createNiveau(niveauData)).rejects.toThrow('La description est requise');
        });
    });

    describe('updateNiveau', () => {
        it('should update niveau successfully', async () => {
            const updateData = { libelle: 'Débutant+', description: 'Niveau débutant amélioré' };
            const existingNiveau = { idniveau: 1, libelle: 'Débutant', description: 'Niveau débutant' };
            const updatedNiveau = { idniveau: 1, ...updateData };

            // Mock pour getNiveauById
            mockQuery.mockResolvedValueOnce({ rows: [existingNiveau] });
            // Mock pour vérifier l'unicité du libelle
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour l'update
            mockQuery.mockResolvedValueOnce({ rows: [updatedNiveau] });

            const result = await NiveauService.updateNiveau(1, updateData);

            expect(result).toEqual(updatedNiveau);
        });

        it('should throw error when niveau not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(NiveauService.updateNiveau(999, { libelle: 'Test' })).rejects.toThrow('Niveau non trouvé');
        });
    });

    describe('deleteNiveau', () => {
        it('should delete niveau successfully', async () => {
            const existingNiveau = { idniveau: 1, libelle: 'Débutant', description: 'Niveau débutant' };
            
            // Mock pour getNiveauById
            mockQuery.mockResolvedValueOnce({ rows: [existingNiveau] });
            // Mock pour les opérations de suppression en transaction
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(NiveauService.deleteNiveau(1)).resolves.not.toThrow();
        });
    });
});