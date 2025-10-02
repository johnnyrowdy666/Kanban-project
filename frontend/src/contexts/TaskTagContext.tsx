import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { TaskTag } from '../types';
import { taskTagAPI } from '../services/api';

interface TaskTagContextType {
  taskTags: TaskTag[];
  loading: boolean;
  error: string | null;
  addTagToTask: (taskId: number, tagId: number) => Promise<void>;
  removeTagFromTask: (taskId: number, tagId: number) => Promise<void>;
  getTagsByTask: (taskId: number) => TaskTag[];
  getTasksByTag: (tagId: number) => TaskTag[];
  fetchTaskTags: (taskId: number) => Promise<void>;
}

const TaskTagContext = createContext<TaskTagContextType | undefined>(undefined);

export const useTaskTags = () => {
  const context = useContext(TaskTagContext);
  if (context === undefined) {
    throw new Error('useTaskTags must be used within a TaskTagProvider');
  }
  return context;
};

interface TaskTagProviderProps {
  children: ReactNode;
}

export const TaskTagProvider: React.FC<TaskTagProviderProps> = ({ children }) => {
  const [taskTags, setTaskTags] = useState<TaskTag[]>([]);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTagToTask = useCallback(async (taskId: number, tagId: number): Promise<void> => {
    try {
      setError(null);
      const response = await taskTagAPI.addTagToTask(taskId, tagId);
      const newTaskTag = response.data;
      setTaskTags(prev => [...prev, newTaskTag]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add tag to task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const removeTagFromTask = useCallback(async (taskId: number, tagId: number): Promise<void> => {
    try {
      setError(null);
      await taskTagAPI.removeTagFromTask(taskId, tagId);
      setTaskTags(prev => prev.filter(tt => !(tt.taskId === taskId && tt.tagId === tagId)));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to remove tag from task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getTagsByTask = useCallback((taskId: number): TaskTag[] => {
    return taskTags.filter(tt => tt.taskId === taskId);
  }, [taskTags]);

  const getTasksByTag = useCallback((tagId: number): TaskTag[] => {
    return taskTags.filter(tt => tt.tagId === tagId);
  }, [taskTags]);

  const fetchTaskTags = useCallback(async (taskId: number): Promise<void> => {
    try {
      setError(null);
      const response = await taskTagAPI.getTaskTags(taskId);
      const fetchedTaskTags = response.data;
      setTaskTags(prev => {
        // Remove existing task tags for this task and add new ones
        const filtered = prev.filter(tt => tt.taskId !== taskId);
        return [...filtered, ...fetchedTaskTags];
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch task tags';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const value: TaskTagContextType = {
    taskTags,
    loading,
    error,
    addTagToTask,
    removeTagFromTask,
    getTagsByTask,
    getTasksByTag,
    fetchTaskTags,
  };

  return (
    <TaskTagContext.Provider value={value}>
      {children}
    </TaskTagContext.Provider>
  );
};
