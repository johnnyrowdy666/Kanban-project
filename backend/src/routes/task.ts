import { Router } from 'express';
import { 
  createTask, 
  getTasksByColumn, 
  getTaskById, 
  updateTask, 
  deleteTask,
  moveTask,
  reorderTasks 
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD routes
router.post('/', createTask);
router.get('/column/:columnId', getTasksByColumn);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);
router.put('/reorder/:columnId', reorderTasks);

export default router;
