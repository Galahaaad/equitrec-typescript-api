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

import { EpreuveService } from '../../src/services/epreuveService';

describe('EpreuveService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue(mockClient);
  });

  describe('createEpreuve', () => {
    it('devrait créer une épreuve valide', async () => {
      const epreuveData = {
        titre: 'Saut d\'obstacles',
        description: 'Épreuve de saut avec parcours technique',
        idfichenotation: 1
      };

      // Mock des requêtes
      mockQuery.mockResolvedValueOnce({ rows: [{ idfichenotation: 1 }] }); // fiche check
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ idepreuve: 1, titre: 'Saut d\'obstacles', description: 'Épreuve de saut avec parcours technique', idfichenotation: 1 }] 
      }); // insert

      const result = await EpreuveService.createEpreuve(epreuveData);

      expect(result).toHaveProperty('idepreuve', 1);
      expect(result.titre).toBe('Saut d\'obstacles');
      expect(result.description).toBe('Épreuve de saut avec parcours technique');
      expect(result.idfichenotation).toBe(1);
    });

    it('devrait créer une épreuve sans fiche de notation', async () => {
      const epreuveData = {
        titre: 'Dressage',
        description: 'Épreuve de dressage classique'
      };

      mockQuery.mockResolvedValueOnce({ 
        rows: [{ idepreuve: 2, titre: 'Dressage', description: 'Épreuve de dressage classique', idfichenotation: null }] 
      }); // insert

      const result = await EpreuveService.createEpreuve(epreuveData);

      expect(result).toHaveProperty('idepreuve', 2);
      expect(result.titre).toBe('Dressage');
      expect(result.description).toBe('Épreuve de dressage classique');
      expect(result.idfichenotation).toBe(null);
    });

    it('devrait rejeter une épreuve sans titre', async () => {
      const epreuveData = {
        description: 'Test'
      };

      await expect(EpreuveService.createEpreuve(epreuveData as any))
        .rejects.toThrow('Le titre est requis');
    });

    it('devrait rejeter une épreuve sans description', async () => {
      const epreuveData = {
        titre: 'Test'
      };

      await expect(EpreuveService.createEpreuve(epreuveData as any))
        .rejects.toThrow('La description est requise');
    });

    it('devrait rejeter un titre trop long', async () => {
      const epreuveData = {
        titre: 'a'.repeat(101),
        description: 'Test description'
      };

      await expect(EpreuveService.createEpreuve(epreuveData))
        .rejects.toThrow('Le titre ne peut pas dépasser 100 caractères');
    });

    it('devrait rejeter une description trop longue', async () => {
      const epreuveData = {
        titre: 'Test titre',
        description: 'a'.repeat(501)
      };

      await expect(EpreuveService.createEpreuve(epreuveData))
        .rejects.toThrow('La description ne peut pas dépasser 500 caractères');
    });

    it('devrait rejeter une fiche de notation inexistante', async () => {
      const epreuveData = {
        titre: 'Test',
        description: 'Test description',
        idfichenotation: 999
      };

      mockQuery.mockResolvedValueOnce({ rows: [] }); // fiche check - pas trouvée

      await expect(EpreuveService.createEpreuve(epreuveData))
        .rejects.toThrow('La fiche de notation spécifiée n\'existe pas');
    });
  });

  describe('getAllEpreuves', () => {
    it('devrait retourner toutes les épreuves', async () => {
      const mockEpreuves = [
        { idepreuve: 1, titre: 'Saut', description: 'Description 1', idfichenotation: 1 },
        { idepreuve: 2, titre: 'Dressage', description: 'Description 2', idfichenotation: null }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockEpreuves });

      const result = await EpreuveService.getAllEpreuves();

      expect(result).toEqual(mockEpreuves);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT idepreuve, titre, description, idfichenotation'));
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Erreur DB'));

      await expect(EpreuveService.getAllEpreuves())
        .rejects.toThrow('Erreur lors de la récupération des épreuves');
    });
  });

  describe('getEpreuveById', () => {
    it('devrait retourner une épreuve par ID', async () => {
      const mockEpreuve = { idepreuve: 1, titre: 'Saut', description: 'Description', idfichenotation: 1 };

      mockQuery.mockResolvedValueOnce({ rows: [mockEpreuve] });

      const result = await EpreuveService.getEpreuveById(1);

      expect(result).toEqual(mockEpreuve);
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('devrait lancer une erreur si l\'épreuve n\'existe pas', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(EpreuveService.getEpreuveById(999))
        .rejects.toThrow('Épreuve non trouvée');
    });
  });

  describe('updateEpreuve', () => {
    it('devrait mettre à jour une épreuve', async () => {
      const updateData = {
        titre: 'Nouveau titre',
        description: 'Nouvelle description'
      };

      const mockExistingEpreuve = { idepreuve: 1, titre: 'Ancien titre', description: 'Ancienne description', idfichenotation: null };
      const mockUpdatedEpreuve = { idepreuve: 1, titre: 'Nouveau titre', description: 'Nouvelle description', idfichenotation: null };

      // Mock getEpreuveById pour vérifier l'existence
      mockQuery.mockResolvedValueOnce({ rows: [mockExistingEpreuve] });
      // Mock update query
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedEpreuve] });
      // Mock getEpreuveById final pour retourner les données mises à jour
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedEpreuve] });

      const result = await EpreuveService.updateEpreuve(1, updateData);

      expect(result).toEqual(mockUpdatedEpreuve);
    });

    it('devrait rejeter la mise à jour sans aucune donnée', async () => {
      const mockExistingEpreuve = { idepreuve: 1, titre: 'Test', description: 'Test', idfichenotation: null };
      mockQuery.mockResolvedValueOnce({ rows: [mockExistingEpreuve] });

      await expect(EpreuveService.updateEpreuve(1, {}))
        .rejects.toThrow('Aucune donnée à mettre à jour');
    });
  });

  describe('deleteEpreuve', () => {
    it('devrait supprimer une épreuve avec transaction', async () => {
      const mockExistingEpreuve = { idepreuve: 1, titre: 'Test', description: 'Test', idfichenotation: null };
      
      // Mock getEpreuveById
      mockQuery.mockResolvedValueOnce({ rows: [mockExistingEpreuve] });
      
      // Mock transaction queries
      mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
      mockClient.query.mockResolvedValueOnce(undefined); // DELETE detenir
      mockClient.query.mockResolvedValueOnce(undefined); // DELETE epreuve
      mockClient.query.mockResolvedValueOnce(undefined); // COMMIT

      await EpreuveService.deleteEpreuve(1);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM detenir WHERE idepreuve = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM epreuve WHERE idepreuve = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait faire un rollback en cas d\'erreur', async () => {
      const mockExistingEpreuve = { idepreuve: 1, titre: 'Test', description: 'Test', idfichenotation: null };
      
      // Mock getEpreuveById
      mockQuery.mockResolvedValueOnce({ rows: [mockExistingEpreuve] });
      
      // Mock transaction avec erreur
      mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
      mockClient.query.mockRejectedValueOnce(new Error('Erreur DB')); // DELETE detenir fails

      await expect(EpreuveService.deleteEpreuve(1))
        .rejects.toThrow('Erreur DB');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getEpreuvesByFicheNotation', () => {
    it('devrait retourner les épreuves d\'une fiche de notation', async () => {
      const mockEpreuves = [
        { idepreuve: 1, titre: 'Saut 1', description: 'Description 1', idfichenotation: 1 },
        { idepreuve: 2, titre: 'Saut 2', description: 'Description 2', idfichenotation: 1 }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockEpreuves });

      const result = await EpreuveService.getEpreuvesByFicheNotation(1);

      expect(result).toEqual(mockEpreuves);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE idfichenotation = $1'), [1]);
    });

    it('devrait gérer les erreurs', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Erreur DB'));

      await expect(EpreuveService.getEpreuvesByFicheNotation(1))
        .rejects.toThrow('Erreur lors de la récupération des épreuves par fiche de notation');
    });
  });
});