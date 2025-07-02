import { Request, Response } from 'express';
import { CritereController } from '../../src/controllers/critereController';
import { CritereService } from '../../src/services/critereService';

// Mock du service
jest.mock('../../src/services/critereService');
const mockCritereService = CritereService as jest.Mocked<typeof CritereService>;

describe('CritereController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseJsonSpy: jest.SpyInstance;
    let responseStatusSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        responseJsonSpy = mockResponse.json as jest.Mock;
        responseStatusSpy = mockResponse.status as jest.Mock;
        jest.clearAllMocks();
    });

    describe('getAllCriteres', () => {
        it('should return all criteres successfully', async () => {
            const mockCriteres = [
                { idcritere: 1, libelle: 'Technique', idniveau: 1, libelleniveau: 'Débutant' },
                { idcritere: 2, libelle: 'Style', idniveau: 2, libelleniveau: 'Intermédiaire' }
            ];
            mockCritereService.getAllCriteres.mockResolvedValue(mockCriteres);

            await CritereController.getAllCriteres(mockRequest as Request, mockResponse as Response);

            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockCriteres,
                message: 'Critères récupérés avec succès'
            });
        });

        it('should handle service error', async () => {
            mockCritereService.getAllCriteres.mockRejectedValue(new Error('Database error'));

            await CritereController.getAllCriteres(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(500);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Erreur lors de la récupération des critères'
            });
        });
    });

    describe('getCritereById', () => {
        it('should return critere by id successfully', async () => {
            const mockCritere = { idcritere: 1, libelle: 'Technique', idniveau: 1, libelleniveau: 'Débutant' };
            mockRequest.params = { id: '1' };
            mockCritereService.getCritereById.mockResolvedValue(mockCritere);

            await CritereController.getCritereById(mockRequest as Request, mockResponse as Response);

            expect(mockCritereService.getCritereById).toHaveBeenCalledWith(1);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockCritere,
                message: 'Critère récupéré avec succès'
            });
        });

        it('should handle invalid id', async () => {
            mockRequest.params = { id: 'invalid' };

            await CritereController.getCritereById(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'ID invalide'
            });
        });

        it('should handle critere not found', async () => {
            mockRequest.params = { id: '999' };
            mockCritereService.getCritereById.mockRejectedValue(new Error('Critère non trouvé'));

            await CritereController.getCritereById(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(404);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Critère non trouvé'
            });
        });
    });

    describe('createCritere', () => {
        it('should create critere successfully', async () => {
            const critereData = { libelle: 'Précision', idniveau: 1 };
            const mockCreatedCritere = { idcritere: 3, ...critereData };
            mockRequest.body = critereData;
            mockCritereService.createCritere.mockResolvedValue(mockCreatedCritere);

            await CritereController.createCritere(mockRequest as Request, mockResponse as Response);

            expect(mockCritereService.createCritere).toHaveBeenCalledWith(critereData);
            expect(responseStatusSpy).toHaveBeenCalledWith(201);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockCreatedCritere,
                message: 'Critère créé avec succès'
            });
        });

        it('should handle validation error', async () => {
            const critereData = { libelle: '', idniveau: 1 };
            mockRequest.body = critereData;
            mockCritereService.createCritere.mockRejectedValue(new Error('Le libellé est requis'));

            await CritereController.createCritere(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Le libellé est requis'
            });
        });
    });

    describe('updateCritere', () => {
        it('should update critere successfully', async () => {
            const updateData = { libelle: 'Technique+' };
            const mockUpdatedCritere = { idcritere: 1, libelle: 'Technique+', idniveau: 1 };
            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            mockCritereService.updateCritere.mockResolvedValue(mockUpdatedCritere);

            await CritereController.updateCritere(mockRequest as Request, mockResponse as Response);

            expect(mockCritereService.updateCritere).toHaveBeenCalledWith(1, updateData);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedCritere,
                message: 'Critère mis à jour avec succès'
            });
        });

        it('should handle invalid id for update', async () => {
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { libelle: 'Test' };

            await CritereController.updateCritere(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'ID invalide'
            });
        });

        it('should handle critere not found for update', async () => {
            mockRequest.params = { id: '999' };
            mockRequest.body = { libelle: 'Test' };
            mockCritereService.updateCritere.mockRejectedValue(new Error('Critère non trouvé'));

            await CritereController.updateCritere(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(404);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Critère non trouvé'
            });
        });
    });

    describe('deleteCritere', () => {
        it('should delete critere successfully', async () => {
            mockRequest.params = { id: '1' };
            mockCritereService.deleteCritere.mockResolvedValue();

            await CritereController.deleteCritere(mockRequest as Request, mockResponse as Response);

            expect(mockCritereService.deleteCritere).toHaveBeenCalledWith(1);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                message: 'Critère supprimé avec succès'
            });
        });

        it('should handle invalid id for deletion', async () => {
            mockRequest.params = { id: 'invalid' };

            await CritereController.deleteCritere(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'ID invalide'
            });
        });

        it('should handle critere not found for deletion', async () => {
            mockRequest.params = { id: '999' };
            mockCritereService.deleteCritere.mockRejectedValue(new Error('Critère non trouvé'));

            await CritereController.deleteCritere(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(404);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Critère non trouvé'
            });
        });
    });
});