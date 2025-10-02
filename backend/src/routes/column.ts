import { Router } from 'express';
import { 
  createColumn, 
  getColumnsByBoard, 
  getColumnById, 
  updateColumn, 
  deleteColumn,
  reorderColumns 
} from '../controllers/columnController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All column routes require authentication
router.use(authenticateToken);

// Column CRUD routes
router.post('/', createColumn);
router.get('/board/:boardId', getColumnsByBoard);
router.get('/:id', getColumnById);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);
router.put('/reorder/:boardId', reorderColumns);

export default router;
