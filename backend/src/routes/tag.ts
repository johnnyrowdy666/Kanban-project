import { Router } from 'express';
import { 
  createTag, 
  getTags, 
  getTagsByBoard,
  getTagById, 
  updateTag, 
  deleteTag 
} from '../controllers/tagController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All tag routes require authentication
router.use(authenticateToken);

// Tag CRUD routes
router.post('/', createTag);
router.get('/', getTags);
router.get('/board/:boardId', getTagsByBoard);
router.get('/:id', getTagById);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;
