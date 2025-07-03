import { Request, Response } from 'express';
import { CategorieController } from '../../src/controllers/categorieController';
import { CategorieService } from '../../src/services/categorieService';

// Mock du service
jest.mock('../../src/services/categorieService');
const mockCategorieService = CategorieService as jest.Mocked<typeof CategorieService>;

describe('CategorieController', () => {
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

    describe('getAllCategories', () => {
        it('should return all categories successfully', async () => {
            const mockCategories = [
                { idcategorie: 1, libelle: 'Allures', notefinal: 10 },
                { idcategorie: 2, libelle: 'Présentation', notefinal: 15 }
            ];
            mockCategorieService.getAllCategories.mockResolvedValue(mockCategories);

            await CategorieController.getAllCategories(mockRequest as Request, mockResponse as Response);

            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockCategories,
                message: 'Catégories récupérées avec succès'
            });
        });

        it('should handle service error', async () => {
            mockCategorieService.getAllCategories.mockRejectedValue(new Error('Database error'));

            await CategorieController.getAllCategories(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(500);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Erreur lors de la récupération des catégories'
            });
        });
    });

    describe('getCategorieById', () => {
        it('should return categorie by id successfully', async () => {
            const mockCategorie = { idcategorie: 1, libelle: 'Allures', notefinal: 10 };
            mockRequest.params = { id: '1' };
            mockCategorieService.getCategorieById.mockResolvedValue(mockCategorie);

            await CategorieController.getCategorieById(mockRequest as Request, mockResponse as Response);

            expect(mockCategorieService.getCategorieById).toHaveBeenCalledWith(1);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockCategorie,
                message: 'Catégorie récupérée avec succès'
            });
        });

        it('should handle invalid id', async () => {
            mockRequest.params = { id: 'invalid' };

            await CategorieController.getCategorieById(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'ID invalide'
            });
        });

        it('should handle categorie not found', async () => {
            mockRequest.params = { id: '999' };
            mockCategorieService.getCategorieById.mockRejectedValue(new Error('Catégorie non trouvée'));

            await CategorieController.getCategorieById(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(404);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Catégorie non trouvée'
            });
        });
    });

    describe('createCategorie', () => {
        it('should create categorie successfully', async () => {
            const categorieData = { libelle: 'Saut', notefinal: 12 };
            const mockCreatedCategorie = { idcategorie: 3, ...categorieData };
            mockRequest.body = categorieData;
            mockCategorieService.createCategorie.mockResolvedValue(mockCreatedCategorie);

            await CategorieController.createCategorie(mockRequest as Request, mockResponse as Response);

            expect(mockCategorieService.createCategorie).toHaveBeenCalledWith(categorieData);
            expect(responseStatusSpy).toHaveBeenCalledWith(201);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockCreatedCategorie,
                message: 'Catégorie créée avec succès'
            });
        });

        it('should handle validation error', async () => {
            const categorieData = { libelle: '', notefinal: 10 };
            mockRequest.body = categorieData;
            mockCategorieService.createCategorie.mockRejectedValue(new Error('Le libellé est requis'));

            await CategorieController.createCategorie(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Le libellé est requis'
            });
        });
    });

    describe('updateCategorie', () => {
        it('should update categorie successfully', async () => {
            const updateData = { libelle: 'Allures+' };
            const mockUpdatedCategorie = { idcategorie: 1, libelle: 'Allures+', notefinal: 10 };
            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            mockCategorieService.updateCategorie.mockResolvedValue(mockUpdatedCategorie);

            await CategorieController.updateCategorie(mockRequest as Request, mockResponse as Response);

            expect(mockCategorieService.updateCategorie).toHaveBeenCalledWith(1, updateData);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedCategorie,
                message: 'Catégorie mise à jour avec succès'
            });
        });

        it('should handle invalid id for update', async () => {
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { libelle: 'Test' };

            await CategorieController.updateCategorie(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'ID invalide'
            });
        });

        it('should handle categorie not found for update', async () => {
            mockRequest.params = { id: '999' };
            mockRequest.body = { libelle: 'Test' };
            mockCategorieService.updateCategorie.mockRejectedValue(new Error('Catégorie non trouvée'));

            await CategorieController.updateCategorie(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(404);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Catégorie non trouvée'
            });
        });
    });

    describe('deleteCategorie', () => {
        it('should delete categorie successfully', async () => {
            mockRequest.params = { id: '1' };
            mockCategorieService.deleteCategorie.mockResolvedValue();

            await CategorieController.deleteCategorie(mockRequest as Request, mockResponse as Response);

            expect(mockCategorieService.deleteCategorie).toHaveBeenCalledWith(1);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: true,
                message: 'Catégorie supprimée avec succès'
            });
        });

        it('should handle invalid id for deletion', async () => {
            mockRequest.params = { id: 'invalid' };

            await CategorieController.deleteCategorie(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(400);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'ID invalide'
            });
        });

        it('should handle categorie not found for deletion', async () => {
            mockRequest.params = { id: '999' };
            mockCategorieService.deleteCategorie.mockRejectedValue(new Error('Catégorie non trouvée'));

            await CategorieController.deleteCategorie(mockRequest as Request, mockResponse as Response);

            expect(responseStatusSpy).toHaveBeenCalledWith(404);
            expect(responseJsonSpy).toHaveBeenCalledWith({
                success: false,
                message: 'Catégorie non trouvée'
            });
        });
    });
});