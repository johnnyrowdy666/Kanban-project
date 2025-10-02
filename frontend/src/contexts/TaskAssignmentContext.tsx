import React, { createContext, useContext, useState, useCallback } from 'react';
import { taskAssignmentAPI } from '../services/api';
import { TaskMember, User } from '../types';

interface TaskAssignmentContextType {
  // State
  assignments: TaskMember[];
  availableUsers: User[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTaskAssignments: (taskId: number) => Promise<void>;
  fetchAvailableUsers: (taskId: number) => Promise<void>;
  assignUserToTask: (taskId: number, userId: number) => Promise<void>;
  unassignUserFromTask: (taskId: number, userId: number) => Promise<void>;
  acceptTaskAssignment: (assignmentId: number) => Promise<void>;
  rejectTaskAssignment: (assignmentId: number) => Promise<void>;
  clearError: () => void;
}

const TaskAssignmentContext = createContext<TaskAssignmentContextType | undefined>(undefined);

export const useTaskAssignment = () => {
  const context = useContext(TaskAssignmentContext);
  if (!context) {
    throw new Error('useTaskAssignment must be used within a TaskAssignmentProvider');
  }
  return context;
};

interface TaskAssignmentProviderProps {
  children: React.ReactNode;
}

export const TaskAssignmentProvider: React.FC<TaskAssignmentProviderProps> = ({ children }) => {
  const [assignments, setAssignments] = useState<TaskMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchTaskAssignments = useCallback(async (taskId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAssignmentAPI.getTaskAssignments(taskId);
      setAssignments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch task assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableUsers = useCallback(async (taskId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAssignmentAPI.getAvailableUsers(taskId);
      setAvailableUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch available users');
    } finally {
      setLoading(false);
    }
  }, []);

  const assignUserToTask = useCallback(async (taskId: number, userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAssignmentAPI.assignUserToTask(taskId, userId);
      
      // Add new assignment to the list
      setAssignments(prev => [...prev, response.data]);
      
      // Remove user from available users
      setAvailableUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign user to task');
    } finally {
      setLoading(false);
    }
  }, []);

  const unassignUserFromTask = useCallback(async (taskId: number, userId: number) => {
    setLoading(true);
    setError(null);
    try {
      await taskAssignmentAPI.unassignUserFromTask(taskId, userId);
      
      // Remove assignment from the list
      setAssignments(prev => prev.filter(assignment => assignment.userId !== userId));
      
      // Add user back to available users (we'll need to refetch to get updated user data)
      // For now, we'll just remove from assignments
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to unassign user from task');
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptTaskAssignment = useCallback(async (assignmentId: number) => {
    setLoading(true);
    setError(null);
    try {
      await taskAssignmentAPI.acceptTaskAssignment(assignmentId);
      
      // Update assignment status in the list
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'ACCEPTED' as const }
            : assignment
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept task assignment');
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectTaskAssignment = useCallback(async (assignmentId: number) => {
    setLoading(true);
    setError(null);
    try {
      await taskAssignmentAPI.rejectTaskAssignment(assignmentId);
      
      // Remove assignment from the list
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject task assignment');
    } finally {
      setLoading(false);
    }
  }, []);

  const value: TaskAssignmentContextType = {
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
    clearError,
  };

  return (
    <TaskAssignmentContext.Provider value={value}>
      {children}
    </TaskAssignmentContext.Provider>
  );
};
