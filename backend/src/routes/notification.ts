import { Router } from 'express';
import { 
  getNotifications, 
  getNotificationById, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

// Notification routes
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.get('/:id', getNotificationById);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

export default router;
