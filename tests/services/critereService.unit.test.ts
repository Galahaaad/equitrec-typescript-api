// Mock de la base de données
const mockQuery = jest.fn();
const mockConnect = jest.fn(() => ({
    query: mockQuery,
    release: jest.fn()
}));

jest.mock('../../src/config/database', () => ({
    pool: {
        query: mockQuery,
        connect: mockConnect
    }
}));

import { CritereService } from '../../src/services/critereService';

describe('CritereService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCriteres', () => {
        it('should return all criteres with niveau info', async () => {
            const mockCriteres = [
                { 
                    idcritere: 1, 
                    libelle: 'Technique', 
                    idniveau: 1,
                    libelleniveau: 'Débutant',
                    descriptionniveau: 'Niveau débutant'
                },
                { 
                    idcritere: 2, 
                    libelle: 'Style', 
                    idniveau: 2,
                    libelleniveau: 'Intermédiaire',
                    descriptionniveau: 'Niveau intermédiaire'
                }
            ];
            mockQuery.mockResolvedValue({ rows: mockCriteres });

            const result = await CritereService.getAllCriteres();

            expect(result).toEqual(mockCriteres);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT c.idcritere, c.libelle, c.idniveau')
            );
        });

        it('should throw error on database failure', async () => {
            mockQuery.mockRejectedValue(new Error('Database error'));

            await expect(CritereService.getAllCriteres()).rejects.toThrow('Erreur lors de la récupération des critères');
        });
    });

    describe('getCritereById', () => {
        it('should return critere by id with niveau info', async () => {
            const mockCritere = { 
                idcritere: 1, 
                libelle: 'Technique', 
                idniveau: 1,
                libelleniveau: 'Débutant',
                descriptionniveau: 'Niveau débutant'
            };
            mockQuery.mockResolvedValue({ rows: [mockCritere] });

            const result = await CritereService.getCritereById(1);

            expect(result).toEqual(mockCritere);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE c.idcritere = $1'),
                [1]
            );
        });

        it('should throw error when critere not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CritereService.getCritereById(999)).rejects.toThrow('Critère non trouvé');
        });
    });

    describe('createCritere', () => {
        it('should create critere successfully', async () => {
            const critereData = { libelle: 'Précision', idniveau: 1 };
            const mockCreatedCritere = { idcritere: 3, ...critereData };

            // Mock pour vérifier que le niveau existe
            mockQuery.mockResolvedValueOnce({ rows: [{ idniveau: 1 }] });
            // Mock pour vérifier l'unicité (aucun critère existant)
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour l'insertion
            mockQuery.mockResolvedValueOnce({ rows: [mockCreatedCritere] });

            const result = await CritereService.createCritere(critereData);

            expect(result).toEqual(mockCreatedCritere);
            expect(mockQuery).toHaveBeenCalledTimes(3);
        });

        it('should throw error for duplicate libelle', async () => {
            const critereData = { libelle: 'Technique', idniveau: 1 };
            
            // Mock pour vérifier que le niveau existe
            mockQuery.mockResolvedValueOnce({ rows: [{ idniveau: 1 }] });
            // Mock pour vérifier l'unicité (critère existant trouvé)
            mockQuery.mockResolvedValueOnce({ rows: [{ idcritere: 1 }] });

            await expect(CritereService.createCritere(critereData)).rejects.toThrow('Un critère avec ce libellé existe déjà');
        });

        it('should throw error for non-existing niveau', async () => {
            const critereData = { libelle: 'Test', idniveau: 999 };
            
            // Mock pour vérifier que le niveau n'existe pas
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CritereService.createCritere(critereData)).rejects.toThrow('Le niveau spécifié n\'existe pas');
        });

        it('should throw error for empty libelle', async () => {
            const critereData = { libelle: '', idniveau: 1 };

            await expect(CritereService.createCritere(critereData)).rejects.toThrow('Le libellé est requis');
        });

        it('should throw error for missing niveau', async () => {
            const critereData = { libelle: 'Test', idniveau: null as any };

            await expect(CritereService.createCritere(critereData)).rejects.toThrow('Le niveau est requis');
        });

        it('should throw error for libelle too long', async () => {
            const critereData = { libelle: 'A'.repeat(101), idniveau: 1 };

            await expect(CritereService.createCritere(critereData)).rejects.toThrow('Le libellé ne peut pas dépasser 100 caractères');
        });
    });

    describe('updateCritere', () => {
        it('should update critere successfully', async () => {
            const updateData = { libelle: 'Technique+', idniveau: 2 };
            const existingCritere = { 
                idcritere: 1, 
                libelle: 'Technique', 
                idniveau: 1,
                libelleniveau: 'Débutant',
                descriptionniveau: 'Niveau débutant'
            };
            const updatedCritere = { 
                idcritere: 1, 
                libelle: 'Technique+', 
                idniveau: 2,
                libelleniveau: 'Intermédiaire',
                descriptionniveau: 'Niveau intermédiaire'
            };

            // Mock pour getCritereById (existing critere)
            mockQuery.mockResolvedValueOnce({ rows: [existingCritere] });
            // Mock pour vérifier l'unicité du libelle
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour vérifier que le nouveau niveau existe
            mockQuery.mockResolvedValueOnce({ rows: [{ idniveau: 2 }] });
            // Mock pour l'update
            mockQuery.mockResolvedValueOnce({ rows: [{ idcritere: 1, libelle: 'Technique+', idniveau: 2 }] });
            // Mock pour le getCritereById final
            mockQuery.mockResolvedValueOnce({ rows: [updatedCritere] });

            const result = await CritereService.updateCritere(1, updateData);

            expect(result).toEqual(updatedCritere);
        });

        it('should throw error when critere not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CritereService.updateCritere(999, { libelle: 'Test' })).rejects.toThrow('Critère non trouvé');
        });

        it('should throw error for non-existing niveau in update', async () => {
            const existingCritere = { 
                idcritere: 1, 
                libelle: 'Technique', 
                idniveau: 1,
                libelleniveau: 'Débutant',
                descriptionniveau: 'Niveau débutant'
            };
            
            // Mock pour getCritereById
            mockQuery.mockResolvedValueOnce({ rows: [existingCritere] });
            // Mock pour vérifier que le niveau n'existe pas
            mockQuery.mockResolvedValueOnce({ rows: [] });

            await expect(CritereService.updateCritere(1, { idniveau: 999 })).rejects.toThrow('Le niveau spécifié n\'existe pas');
        });
    });

    describe('deleteCritere', () => {
        it('should delete critere successfully', async () => {
            const existingCritere = { 
                idcritere: 1, 
                libelle: 'Technique', 
                idniveau: 1,
                libelleniveau: 'Débutant',
                descriptionniveau: 'Niveau débutant'
            };
            
            // Mock pour getCritereById
            mockQuery.mockResolvedValueOnce({ rows: [existingCritere] });
            // Mock pour BEGIN transaction
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour DELETE detenir
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour DELETE critere
            mockQuery.mockResolvedValueOnce({ rows: [] });
            // Mock pour COMMIT
            mockQuery.mockResolvedValueOnce({ rows: [] });

            await expect(CritereService.deleteCritere(1)).resolves.not.toThrow();
        });

        it('should throw error when critere not found for deletion', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(CritereService.deleteCritere(999)).rejects.toThrow('Critère non trouvé');
        });
    });
});