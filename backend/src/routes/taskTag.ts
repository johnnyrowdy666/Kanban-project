import { Router } from 'express';
import { 
  addTagToTask, 
  removeTagFromTask, 
  getTaskTags,
  getTasksByTag 
} from '../controllers/taskTagController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task tag routes require authentication
router.use(authenticateToken);

// Task tag management routes
router.post('/add', addTagToTask);
router.delete('/task/:taskId/tag/:tagId', removeTagFromTask);
router.get('/task/:taskId', getTaskTags);
router.get('/tag/:tagId/tasks', getTasksByTag);

export default router;
