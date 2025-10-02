import React, { useState, useEffect } from 'react';
import { Bell, X, Check, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationAPI } from '../services/api';
import { Notification } from '../types';

interface NotificationBellProps {
  onAcceptAssignment?: (assignmentId: number) => void;
  onRejectAssignment?: (assignmentId: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onAcceptAssignment,
  onRejectAssignment
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingNotifications, setProcessingNotifications] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications({ 
        limit: 10, 
        unreadOnly: false 
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleAcceptAssignment = async (notification: Notification) => {
    if (notification.data?.assignmentId && onAcceptAssignment) {
      setProcessingNotifications(prev => new Set(prev).add(notification.id));
      try {
        await onAcceptAssignment(notification.data.assignmentId);
        // Refresh notifications to get updated list from server
        await fetchNotifications();
      } catch (error) {
        console.error('Failed to accept assignment:', error);
      } finally {
        setProcessingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }
    }
  };

  const handleRejectAssignment = async (notification: Notification) => {
    if (notification.data?.assignmentId && onRejectAssignment) {
      setProcessingNotifications(prev => new Set(prev).add(notification.id));
      try {
        await onRejectAssignment(notification.data.assignmentId);
        // Refresh notifications to get updated list from server
        await fetchNotifications();
      } catch (error) {
        console.error('Failed to reject assignment:', error);
      } finally {
        setProcessingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNMENT':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'TASK_ASSIGNMENT_ACCEPTED':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'TASK_ASSIGNMENT_REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'BOARD_INVITATION':
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Action Buttons for Task Assignments - Only show for assigned user */}
                        {notification.type === 'TASK_ASSIGNMENT' && 
                         notification.data?.assignmentId && 
                         notification.data?.assignedBy !== user?.id && (
                          <div className="flex items-center space-x-2 mt-3">
                            <button
                              onClick={() => handleAcceptAssignment(notification)}
                              disabled={processingNotifications.has(notification.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-3 h-3" />
                              <span>{processingNotifications.has(notification.id) ? 'Processing...' : 'Accept'}</span>
                            </button>
                            <button
                              onClick={() => handleRejectAssignment(notification)}
                              disabled={processingNotifications.has(notification.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>{processingNotifications.has(notification.id) ? 'Processing...' : 'Reject'}</span>
                            </button>
                          </div>
                        )}

                        {/* Status Display for Task Assignments - Show for assigner */}
                        {notification.type === 'TASK_ASSIGNMENT' && 
                         notification.data?.assignmentId && 
                         notification.data?.assignedBy === user?.id && (
                          <div className="flex items-center space-x-2 mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Response
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Mark all as read
                  notifications.forEach(notif => {
                    if (!notif.isRead) {
                      markAsRead(notif.id);
                    }
                  });
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
