import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, UserController.getAllUsers);
router.get('/:id', authenticateToken, UserController.getUserById);

router.put('/:id', authenticateToken, requireSuperAdmin, UserController.updateUser);
router.delete('/:id', authenticateToken, requireSuperAdmin, UserController.deleteUser);

export default router;