import request from 'supertest';
import express from 'express';
import { FicheNotationController } from '../../src/controllers/ficheNotationController';
import { FicheNotationService } from '../../src/services/ficheNotationService';

// Mock du service
jest.mock('../../src/services/ficheNotationService');

const app = express();
app.use(express.json());

// Routes de test
app.get('/fiches', FicheNotationController.getAllFichesNotation);
app.get('/fiches/:id', FicheNotationController.getFicheNotationById);
app.get('/cavaliers/:cavalierId/fiches', FicheNotationController.getFichesNotationByCavalier);
app.post('/fiches', FicheNotationController.createFicheNotation);
app.put('/fiches/:id', FicheNotationController.updateFicheNotation);
app.delete('/fiches/:id', FicheNotationController.deleteFicheNotation);

const mockFicheNotationService = FicheNotationService as jest.Mocked<typeof FicheNotationService>;

describe('FicheNotationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /fiches', () => {
    it('devrait retourner toutes les fiches de notation', async () => {
      const mockFiches = [
        { idfichenotation: 1, cumulenote: 85, appreciation: 'Bonne performance' },
        { idfichenotation: 2, cumulenote: 90, appreciation: 'Excellente performance' }
      ];

      mockFicheNotationService.getAllFichesNotation.mockResolvedValue(mockFiches as any);

      const response = await request(app).get('/fiches');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockFiches,
        message: 'Fiches de notation récupérées avec succès'
      });
      expect(mockFicheNotationService.getAllFichesNotation).toHaveBeenCalledTimes(1);
    });

    it('devrait retourner une erreur 500 en cas d\'exception', async () => {
      mockFicheNotationService.getAllFichesNotation.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/fiches');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erreur lors de la récupération des fiches de notation'
      });
    });
  });

  describe('GET /fiches/:id', () => {
    it('devrait retourner une fiche de notation par ID', async () => {
      const mockFiche = { idfichenotation: 1, cumulenote: 85, appreciation: 'Bonne performance' };
      mockFicheNotationService.getFicheNotationById.mockResolvedValue(mockFiche as any);

      const response = await request(app).get('/fiches/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockFiche,
        message: 'Fiche de notation récupérée avec succès'
      });
      expect(mockFicheNotationService.getFicheNotationById).toHaveBeenCalledWith(1);
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app).get('/fiches/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID invalide'
      });
    });

    it('devrait retourner 404 pour une fiche non trouvée', async () => {
      mockFicheNotationService.getFicheNotationById.mockRejectedValue(
        new Error('Fiche de notation non trouvée')
      );

      const response = await request(app).get('/fiches/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Fiche de notation non trouvée'
      });
    });
  });

  describe('GET /cavaliers/:cavalierId/fiches', () => {
    it('devrait retourner les fiches d\'un cavalier', async () => {
      const mockFiches = [
        { idfichenotation: 1, cumulenote: 85, idcavalier: 1 }
      ];
      mockFicheNotationService.getFichesNotationByCavalier.mockResolvedValue(mockFiches as any);

      const response = await request(app).get('/cavaliers/1/fiches');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockFiches,
        message: 'Fiches de notation du cavalier récupérées avec succès'
      });
      expect(mockFicheNotationService.getFichesNotationByCavalier).toHaveBeenCalledWith(1);
    });

    it('devrait retourner 400 pour un ID cavalier invalide', async () => {
      const response = await request(app).get('/cavaliers/invalid/fiches');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID cavalier invalide'
      });
    });
  });

  describe('POST /fiches', () => {
    it('devrait créer une nouvelle fiche de notation', async () => {
      const nouvelleFiche = {
        cumulenote: 88,
        appreciation: 'Très bonne performance',
        isvalidate: false,
        idcavalier: 1
      };
      const ficheCreee = { idfichenotation: 1, ...nouvelleFiche };

      mockFicheNotationService.createFicheNotation.mockResolvedValue(ficheCreee as any);

      const response = await request(app)
        .post('/fiches')
        .send(nouvelleFiche);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: ficheCreee,
        message: 'Fiche de notation créée avec succès'
      });
      expect(mockFicheNotationService.createFicheNotation).toHaveBeenCalledWith(nouvelleFiche);
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      const donneesInvalides = { cumulenote: 'invalid' };
      mockFicheNotationService.createFicheNotation.mockRejectedValue(
        new Error('Le cumul de note est requis')
      );

      const response = await request(app)
        .post('/fiches')
        .send(donneesInvalides);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Le cumul de note est requis'
      });
    });
  });

  describe('PUT /fiches/:id', () => {
    it('devrait mettre à jour une fiche de notation', async () => {
      const donneesModification = {
        cumulenote: 95,
        appreciation: 'Performance exceptionnelle'
      };
      const ficheModifiee = { idfichenotation: 1, ...donneesModification };

      mockFicheNotationService.updateFicheNotation.mockResolvedValue(ficheModifiee as any);

      const response = await request(app)
        .put('/fiches/1')
        .send(donneesModification);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: ficheModifiee,
        message: 'Fiche de notation mise à jour avec succès'
      });
      expect(mockFicheNotationService.updateFicheNotation).toHaveBeenCalledWith(1, donneesModification);
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app)
        .put('/fiches/invalid')
        .send({ cumulenote: 95 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID invalide'
      });
    });

    it('devrait retourner 404 pour une fiche non trouvée', async () => {
      mockFicheNotationService.updateFicheNotation.mockRejectedValue(
        new Error('Fiche de notation non trouvée')
      );

      const response = await request(app)
        .put('/fiches/999')
        .send({ cumulenote: 95 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Fiche de notation non trouvée'
      });
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      mockFicheNotationService.updateFicheNotation.mockRejectedValue(
        new Error('Aucune donnée à mettre à jour')
      );

      const response = await request(app)
        .put('/fiches/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    });
  });

  describe('DELETE /fiches/:id', () => {
    it('devrait supprimer une fiche de notation', async () => {
      mockFicheNotationService.deleteFicheNotation.mockResolvedValue();

      const response = await request(app).delete('/fiches/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Fiche de notation supprimée avec succès'
      });
      expect(mockFicheNotationService.deleteFicheNotation).toHaveBeenCalledWith(1);
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app).delete('/fiches/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID invalide'
      });
    });

    it('devrait retourner 404 pour une fiche non trouvée', async () => {
      mockFicheNotationService.deleteFicheNotation.mockRejectedValue(
        new Error('Fiche de notation non trouvée')
      );

      const response = await request(app).delete('/fiches/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Fiche de notation non trouvée'
      });
    });

    it('devrait retourner 500 pour une erreur de base de données', async () => {
      mockFicheNotationService.deleteFicheNotation.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app).delete('/fiches/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erreur lors de la suppression de la fiche de notation'
      });
    });
  });

  describe('Gestion des erreurs génériques', () => {
    it('devrait gérer les erreurs non-Error objects', async () => {
      mockFicheNotationService.createFicheNotation.mockRejectedValue('String error');

      const response = await request(app)
        .post('/fiches')
        .send({ cumulenote: 85 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Erreur lors de la création de la fiche de notation');
    });

    it('devrait gérer les erreurs lors de la mise à jour avec message générique', async () => {
      mockFicheNotationService.updateFicheNotation.mockRejectedValue('String error');

      const response = await request(app)
        .put('/fiches/1')
        .send({ cumulenote: 95 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Erreur lors de la mise à jour de la fiche de notation');
    });
  });
});