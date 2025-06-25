import { FicheNotationService } from '../../src/services/ficheNotationService';
import { cleanupTables, testPool } from '../setup';

// Mock du pool de base de données pour les tests unitaires
jest.mock('../../src/config/database', () => ({
  pool: testPool
}));

describe('FicheNotationService', () => {
  beforeEach(async () => {
    // Nettoyer les tables avant chaque test
    await cleanupTables(['contenir', 'epreuve', 'fichenotation', 'cavalier', 'club']);
    
    // Insérer des données de test
    await testPool.query(`
      INSERT INTO club (idclub, nomclub) VALUES (1, 'Club Test')
    `);
    
    await testPool.query(`
      INSERT INTO cavalier (idcavalier, nomcavalier, prenomcavalier, datenaissance, numerodossard, idclub) 
      VALUES (1, 'Dupont', 'Jean', '1990-01-01', 123, 1)
    `);
  });

  describe('createFicheNotation', () => {
    it('devrait créer une fiche de notation valide', async () => {
      const ficheData = {
        cumulenote: 85,
        appreciation: 'Très bonne performance',
        isvalidate: false,
        idcavalier: 1
      };

      const result = await FicheNotationService.createFicheNotation(ficheData);

      expect(result).toHaveProperty('idfichenotation');
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

    it('devrait rejeter une fiche sans appréciation', async () => {
      const ficheData = {
        cumulenote: 85,
        appreciation: '',
        isvalidate: false,
        idcavalier: 1
      };

      await expect(FicheNotationService.createFicheNotation(ficheData))
        .rejects.toThrow('L\'appréciation est requise');
    });

    it('devrait rejeter une fiche avec cavalier inexistant', async () => {
      const ficheData = {
        cumulenote: 85,
        appreciation: 'Test',
        isvalidate: false,
        idcavalier: 999
      };

      await expect(FicheNotationService.createFicheNotation(ficheData))
        .rejects.toThrow('Le cavalier spécifié n\'existe pas');
    });

    it('devrait rejeter une appréciation trop longue', async () => {
      const ficheData = {
        cumulenote: 85,
        appreciation: 'A'.repeat(501), // Plus de 500 caractères
        isvalidate: false,
        idcavalier: 1
      };

      await expect(FicheNotationService.createFicheNotation(ficheData))
        .rejects.toThrow('L\'appréciation ne peut pas dépasser 500 caractères');
    });
  });

  describe('getFicheNotationById', () => {
    it('devrait récupérer une fiche existante', async () => {
      // Créer une fiche de test
      const insertResult = await testPool.query(`
        INSERT INTO fichenotation (cumulenote, appreciation, isvalidate, idcavalier) 
        VALUES (90, 'Excellente performance', true, 1) 
        RETURNING idfichenotation
      `);
      const ficheId = insertResult.rows[0].idfichenotation;

      const result = await FicheNotationService.getFicheNotationById(ficheId);

      expect(result.idfichenotation).toBe(ficheId);
      expect(result.cumulenote).toBe(90);
      expect(result.appreciation).toBe('Excellente performance');
      expect(result.isvalidate).toBe(true);
    });

    it('devrait rejeter une fiche inexistante', async () => {
      await expect(FicheNotationService.getFicheNotationById(999))
        .rejects.toThrow('Fiche de notation non trouvée');
    });
  });

  describe('updateFicheNotation', () => {
    let ficheId: number;

    beforeEach(async () => {
      const insertResult = await testPool.query(`
        INSERT INTO fichenotation (cumulenote, appreciation, isvalidate, idcavalier) 
        VALUES (75, 'Performance correcte', false, 1) 
        RETURNING idfichenotation
      `);
      ficheId = insertResult.rows[0].idfichenotation;
    });

    it('devrait mettre à jour une fiche existante', async () => {
      const updateData = {
        cumulenote: 95,
        appreciation: 'Performance exceptionnelle',
        isvalidate: true
      };

      const result = await FicheNotationService.updateFicheNotation(ficheId, updateData);

      expect(result.cumulenote).toBe(95);
      expect(result.appreciation).toBe('Performance exceptionnelle');
      expect(result.isvalidate).toBe(true);
    });

    it('devrait rejeter la mise à jour sans données', async () => {
      await expect(FicheNotationService.updateFicheNotation(ficheId, {}))
        .rejects.toThrow('Aucune donnée à mettre à jour');
    });
  });

  describe('deleteFicheNotation - Transaction Logic', () => {
    let ficheId: number;
    let epreuveId: number;

    beforeEach(async () => {
      // Créer une fiche de test
      const ficheResult = await testPool.query(`
        INSERT INTO fichenotation (cumulenote, appreciation, isvalidate, idcavalier) 
        VALUES (80, 'Test deletion', false, 1) 
        RETURNING idfichenotation
      `);
      ficheId = ficheResult.rows[0].idfichenotation;

      // Créer une épreuve liée à cette fiche
      const epreuveResult = await testPool.query(`
        INSERT INTO epreuve (titre, description, idfichenotation) 
        VALUES ('Test Epreuve', 'Description test', $1) 
        RETURNING idepreuve
      `, [ficheId]);
      epreuveId = epreuveResult.rows[0].idepreuve;

      // Créer un enregistrement dans contenir
      await testPool.query(`
        INSERT INTO categorie (idcategorie, libelle, notefinal) VALUES (1, 'Test Category', 20)
      `);
      await testPool.query(`
        INSERT INTO contenir (idfichenotation, idcategorie, idnote) VALUES ($1, 1, 1)
      `, [ficheId]);
    });

    it('devrait supprimer la fiche et nullifier les références des épreuves', async () => {
      await FicheNotationService.deleteFicheNotation(ficheId);

      // Vérifier que la fiche est supprimée
      const ficheResult = await testPool.query(
        'SELECT * FROM fichenotation WHERE idfichenotation = $1', 
        [ficheId]
      );
      expect(ficheResult.rows).toHaveLength(0);

      // Vérifier que l'épreuve existe toujours mais avec idfichenotation = NULL
      const epreuveResult = await testPool.query(
        'SELECT * FROM epreuve WHERE idepreuve = $1', 
        [epreuveId]
      );
      expect(epreuveResult.rows).toHaveLength(1);
      expect(epreuveResult.rows[0].idfichenotation).toBeNull();

      // Vérifier que les enregistrements contenir sont supprimés
      const contenirResult = await testPool.query(
        'SELECT * FROM contenir WHERE idfichenotation = $1', 
        [ficheId]
      );
      expect(contenirResult.rows).toHaveLength(0);
    });

    it('devrait faire un rollback si une erreur survient', async () => {
      // Mock pour simuler une erreur lors de la suppression
      const originalQuery = testPool.query;
      let callCount = 0;
      
      testPool.query = jest.fn().mockImplementation(async (text, params) => {
        callCount++;
        // Simuler une erreur à la 4ème requête (DELETE fichenotation)
        if (callCount === 4 && text.includes('DELETE FROM fichenotation')) {
          throw new Error('Simulated database error');
        }
        return originalQuery.call(testPool, text, params);
      }) as any;

      await expect(FicheNotationService.deleteFicheNotation(ficheId))
        .rejects.toThrow('Simulated database error');

      // Restaurer la méthode originale
      testPool.query = originalQuery;

      // Vérifier que la fiche existe toujours (rollback effectué)
      const ficheResult = await testPool.query(
        'SELECT * FROM fichenotation WHERE idfichenotation = $1', 
        [ficheId]
      );
      expect(ficheResult.rows).toHaveLength(1);

      // Vérifier que l'épreuve a toujours sa référence (rollback effectué)
      const epreuveResult = await testPool.query(
        'SELECT * FROM epreuve WHERE idepreuve = $1', 
        [epreuveId]
      );
      expect(epreuveResult.rows).toHaveLength(1);
      expect(epreuveResult.rows[0].idfichenotation).toBe(ficheId);
    });

    it('devrait rejeter la suppression d\'une fiche inexistante', async () => {
      await expect(FicheNotationService.deleteFicheNotation(999))
        .rejects.toThrow('Fiche de notation non trouvée');
    });
  });

  describe('getAllFichesNotation', () => {
    it('devrait récupérer toutes les fiches de notation', async () => {
      // Créer plusieurs fiches de test
      await testPool.query(`
        INSERT INTO fichenotation (cumulenote, appreciation, isvalidate, idcavalier) 
        VALUES 
        (85, 'Première fiche', true, 1),
        (90, 'Deuxième fiche', false, 1)
      `);

      const result = await FicheNotationService.getAllFichesNotation();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('nomcavalier', 'Dupont');
      expect(result[0]).toHaveProperty('prenomcavalier', 'Jean');
    });
  });

  describe('getFichesNotationByCavalier', () => {
    it('devrait récupérer les fiches d\'un cavalier spécifique', async () => {
      await testPool.query(`
        INSERT INTO fichenotation (cumulenote, appreciation, isvalidate, idcavalier) 
        VALUES (88, 'Fiche du cavalier 1', true, 1)
      `);

      const result = await FicheNotationService.getFichesNotationByCavalier(1);

      expect(result).toHaveLength(1);
      expect(result[0].idcavalier).toBe(1);
      expect(result[0].appreciation).toBe('Fiche du cavalier 1');
    });
  });
});