import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// Routes de consultation (authentifié)
router.get('/', authenticateToken, UserController.getAllUsers);
router.get('/:id', authenticateToken, UserController.getUserById);

// Routes d'administration (SUPER_ADMIN uniquement)
router.put('/:id', authenticateToken, requireSuperAdmin, UserController.updateUser);
router.delete('/:id', authenticateToken, requireSuperAdmin, UserController.deleteUser);

export default router;