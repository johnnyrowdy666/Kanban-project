import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Users, Check, XCircle, Clock } from 'lucide-react';
import { useTaskAssignment } from '../contexts/TaskAssignmentContext';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';

interface TaskAssignmentModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  task,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const {
    assignments,
    availableUsers,
    loading,
    error,
    fetchTaskAssignments,
    fetchAvailableUsers,
    assignUserToTask,
    unassignUserFromTask,
    acceptTaskAssignment,
    rejectTaskAssignment,
    clearError
  } = useTaskAssignment();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskAssignments(task.id);
      fetchAvailableUsers(task.id);
    }
  }, [isOpen, task, fetchTaskAssignments, fetchAvailableUsers]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await assignUserToTask(task.id, selectedUserId);
      setSelectedUserId(null);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleUnassignUser = async (userId: number) => {
    try {
      await unassignUserFromTask(task.id, userId);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleAcceptAssignment = async (assignmentId: number) => {
    try {
      await acceptTaskAssignment(assignmentId);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleRejectAssignment = async (assignmentId: number) => {
    try {
      await rejectTaskAssignment(assignmentId);
    } catch (error) {
      // Error is handled by context
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Accepted';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'REJECTED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Task Assignments</h2>
              <p className="text-sm text-gray-600">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Current Assignments */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Members</h3>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No members assigned to this task</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {assignment.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{assignment.user.username}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            <span className="ml-1">{getStatusText(assignment.status)}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{assignment.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Only show Accept/Reject buttons for the assigned user */}
                      {assignment.status === 'PENDING' && assignment.userId === user?.id && (
                        <>
                          <button
                            onClick={() => handleAcceptAssignment(assignment.id)}
                            disabled={loading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                            title="Accept Assignment"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectAssignment(assignment.id)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Reject Assignment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {/* Show status for assigner when pending */}
                      {assignment.status === 'PENDING' && assignment.userId !== user?.id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting for response
                        </span>
                      )}
                      {/* Show remove button for accepted assignments (only for assigner or task creator) */}
                      {assignment.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUnassignUser(assignment.userId)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Remove Assignment"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Assignment */}
          {availableUsers.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign New Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Member
                  </label>
                  <select
                    value={selectedUserId || ''}
                    onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a member...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignUser}
                  disabled={!selectedUserId || loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Member</span>
                </button>
              </div>
            </div>
          )}

          {/* No Available Users */}
          {availableUsers.length === 0 && assignments.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No available members to assign</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignmentModal;
