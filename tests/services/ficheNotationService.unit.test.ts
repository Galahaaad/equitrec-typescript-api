// Mock du pool avant les imports
const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

jest.mock('../../src/config/database', () => ({
  pool: {
    query: mockQuery,
    connect: () => mockConnect()
  }
}));

import { FicheNotationService } from '../../src/services/ficheNotationService';

describe('FicheNotationService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue(mockClient);
  });

  describe('createFicheNotation', () => {
    it('devrait créer une fiche de notation valide', async () => {
      const ficheData = {
        cumulenote: 85,
        appreciation: 'Très bonne performance',
        isvalidate: false,
        idcavalier: 1
      };

      // Mock des requêtes
      mockQuery.mockResolvedValueOnce({ rows: [{ idcavalier: 1 }] }); // cavalier check
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ idfichenotation: 1, cumulenote: 85, appreciation: 'Très bonne performance', isvalidate: false, idcavalier: 1 }] 
      }); // insert

      const result = await FicheNotationService.createFicheNotation(ficheData);

      expect(result).toHaveProperty('idfichenotation', 1);
      expect(result.cumulenote).toBe(85);
      expect(result.appreciation).toBe('Très bonne performance');
      expect(result.isvalidate).toBe(false);
      expect(result.idcavalier).toBe(1);
    });

    it('devrait rejeter une fiche sans cumul de note', async () => {
      const ficheData = {
        appreciation: 'Test',
        isvalidate: false,
        idcavalier: 1
      } as any;

      await expect(FicheNotationService.createFicheNotation(ficheData))
        .rejects.toThrow('Le cumul de note est requis');
    });

    it('devrait rejeter une fiche avec cavalier inexistant', async () => {
      const ficheData = {
        cumulenote: 85,
        appreciation: 'Test',
        isvalidate: false,
        idcavalier: 999
      };

      // Mock cavalier check failed
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(FicheNotationService.createFicheNotation(ficheData))
        .rejects.toThrow('Le cavalier spécifié n\'existe pas');
    });
  });

  describe('deleteFicheNotation - Transaction Logic', () => {
    beforeEach(() => {
      // Mock client pour les transactions
      mockClient.query.mockImplementation(async (query) => {
        if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') {
          return {};
        }
        if (query.includes('SELECT fn.idfichenotation')) {
          return { rows: [{ idfichenotation: 1 }] }; // fiche exists
        }
        return { rows: [] };
      });
    });

    it('devrait supprimer la fiche avec transaction réussie', async () => {
      // Mock getFicheNotationById (appelé pour vérifier l'existence)
      mockQuery.mockResolvedValueOnce({ rows: [{ idfichenotation: 1 }] });

      await FicheNotationService.deleteFicheNotation(1);

      // Vérifier les appels de transaction
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE epreuve SET idfichenotation = NULL WHERE idfichenotation = $1',
        [1]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM contenir WHERE idfichenotation = $1',
        [1]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM fichenotation WHERE idfichenotation = $1',
        [1]
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait faire un rollback si une erreur survient', async () => {
      // Mock getFicheNotationById (appelé pour vérifier l'existence)
      mockQuery.mockResolvedValueOnce({ rows: [{ idfichenotation: 1 }] });

      // Simuler une erreur lors de la suppression
      mockClient.query.mockImplementation(async (query) => {
        if (query === 'BEGIN' || query === 'ROLLBACK') {
          return {};
        }
        if (query.includes('DELETE FROM fichenotation')) {
          throw new Error('Database error');
        }
        return { rows: [] };
      });

      await expect(FicheNotationService.deleteFicheNotation(1))
        .rejects.toThrow('Database error');

      // Vérifier le rollback
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getAllFichesNotation', () => {
    it('devrait récupérer toutes les fiches de notation', async () => {
      const mockFiches = [
        { idfichenotation: 1, cumulenote: 85, nomcavalier: 'Dupont' },
        { idfichenotation: 2, cumulenote: 90, nomcavalier: 'Martin' }
      ];
      
      mockQuery.mockResolvedValueOnce({ rows: mockFiches });

      const result = await FicheNotationService.getAllFichesNotation();

      expect(result).toEqual(mockFiches);
      expect(result).toHaveLength(2);
    });
  });
});