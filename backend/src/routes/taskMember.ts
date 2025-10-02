import { Router } from 'express';
import { 
  assignTaskMember, 
  getTaskMembers, 
  removeTaskMember 
} from '../controllers/taskMemberController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task member routes require authentication
router.use(authenticateToken);

// Task member management routes
router.post('/assign', assignTaskMember);
router.get('/task/:taskId', getTaskMembers);
router.delete('/task/:taskId/member/:memberId', removeTaskMember);

export default router;
