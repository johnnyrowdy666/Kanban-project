import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  assignUserToTask,
  unassignUserFromTask,
  getTaskAssignments,
  getAvailableUsers,
  acceptTaskAssignment,
  rejectTaskAssignment
} from '../controllers/taskAssignmentController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Assign user to task
router.post('/:taskId/assign/:userId', assignUserToTask);

// Unassign user from task
router.delete('/:taskId/unassign/:userId', unassignUserFromTask);

// Get task assignments
router.get('/:taskId/assignments', getTaskAssignments);

// Get available users for assignment
router.get('/:taskId/available-users', getAvailableUsers);

// Accept task assignment
router.put('/:assignmentId/accept', acceptTaskAssignment);

// Reject task assignment
router.put('/:assignmentId/reject', rejectTaskAssignment);

export default router;
