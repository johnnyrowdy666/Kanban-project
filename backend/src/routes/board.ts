import { Router } from 'express';
import { createBoard, getBoards, getBoardById, updateBoard, deleteBoard } from '../controllers/boardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD routes
router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;
