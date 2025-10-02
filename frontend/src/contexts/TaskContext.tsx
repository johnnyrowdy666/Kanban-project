import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Task, CreateTaskForm } from '../types';
import { taskAPI } from '../services/api';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasksByColumn: (columnId: number) => Promise<void>;
  createTask: (data: CreateTaskForm) => Promise<Task>;
  updateTask: (id: number, data: Partial<CreateTaskForm>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  moveTask: (id: number, columnId: number, position: number) => Promise<Task>;
  reorderTasks: (columnId: number, taskIds: number[]) => Promise<void>;
  getTasksByColumn: (columnId: number) => Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createTaskRef = useRef<Promise<Task> | null>(null);

  const fetchTasksByColumn = useCallback(async (columnId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getTasksByColumn(columnId);
      const newTasks = response.data.tasks;
      setTasks(prev => {
        // Remove existing tasks from this column and add new ones
        const filteredTasks = prev.filter(task => task.columnId !== columnId);
        return [...filteredTasks, ...newTasks];
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskForm): Promise<Task> => {
    // If there's already a create task request in progress, return that promise
    if (createTaskRef.current) {
      return createTaskRef.current;
    }
    
    const createTaskPromise = (async () => {
      try {
        setError(null);
        const response = await taskAPI.createTask(data);
        const newTask = response.data.task;
        
        setTasks(prev => {
          // Check if task already exists to avoid duplicates
          const exists = prev.some(task => task.id === newTask.id);
          if (exists) return prev;
          return [...prev, newTask];
        });
        
        return newTask;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Failed to create task';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        createTaskRef.current = null;
      }
    })();
    
    createTaskRef.current = createTaskPromise;
    return createTaskPromise;
  }, []);

  const updateTask = async (id: number, data: Partial<CreateTaskForm>): Promise<Task> => {
    try {
      setError(null);
      const response = await taskAPI.updateTask(id, data);
      const updatedTask = response.data.task;
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    try {
      setError(null);
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const moveTask = async (id: number, columnId: number, position: number): Promise<Task> => {
    try {
      setError(null);
      console.log(`Moving task ${id} to column ${columnId} at position ${position}`);
      const response = await taskAPI.moveTask(id, { columnId, position });
      const movedTask = response.data.task;
      console.log('Moved task:', movedTask);
      setTasks(prev => prev.map(task => 
        task.id === id ? movedTask : task
      ));
      return movedTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to move task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const reorderTasks = async (columnId: number, taskIds: number[]): Promise<void> => {
    try {
      setError(null);
      console.log('Reordering tasks:', { columnId, taskIds });
      await taskAPI.reorderTasks(columnId, taskIds);
      
      // Refresh tasks for this column to get updated positions from server
      await fetchTasksByColumn(columnId);
      
      console.log('Tasks reordered successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to reorder tasks';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTasksByColumn = useCallback((columnId: number): Task[] => {
    return tasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  }, [tasks]);

  const value: TaskContextType = {
    tasks,
    loading,
    error,
    fetchTasksByColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    getTasksByColumn,
    setTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
