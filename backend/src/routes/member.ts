import { Router } from 'express';
import { 
  inviteMember, 
  getBoardMembers, 
  removeMember, 
  leaveBoard,
  searchUsers 
} from '../controllers/memberController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All member routes require authentication
router.use(authenticateToken);

// Member management routes
router.post('/invite', inviteMember);
router.get('/board/:boardId', getBoardMembers);
router.delete('/:memberId', removeMember);
router.delete('/board/:boardId/leave', leaveBoard);
router.get('/search', searchUsers);

export default router;
