import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Column, CreateColumnForm } from '../types';
import { columnAPI } from '../services/api';

interface ColumnContextType {
  columns: Column[];
  loading: boolean;
  error: string | null;
  fetchColumns: (boardId: number) => Promise<void>;
  createColumn: (data: CreateColumnForm) => Promise<Column>;
  updateColumn: (id: number, data: { name: string }) => Promise<Column>;
  deleteColumn: (id: number) => Promise<void>;
  reorderColumns: (boardId: number, columnIds: number[]) => Promise<void>;
}

const ColumnContext = createContext<ColumnContextType | undefined>(undefined);

export const useColumns = () => {
  const context = useContext(ColumnContext);
  if (context === undefined) {
    throw new Error('useColumns must be used within a ColumnProvider');
  }
  return context;
};

interface ColumnProviderProps {
  children: ReactNode;
}

export const ColumnProvider: React.FC<ColumnProviderProps> = ({ children }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = useCallback(async (boardId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await columnAPI.getColumnsByBoard(boardId);
      setColumns(response.data.columns);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch columns');
      console.error('Fetch columns error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createColumn = async (data: CreateColumnForm): Promise<Column> => {
    try {
      setError(null);
      const response = await columnAPI.createColumn(data);
      const newColumn = response.data.column;
      setColumns(prev => [...prev, newColumn]);
      return newColumn;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create column';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateColumn = async (id: number, data: { name: string }): Promise<Column> => {
    try {
      setError(null);
      const response = await columnAPI.updateColumn(id, data);
      const updatedColumn = response.data.column;
      setColumns(prev => prev.map(column => 
        column.id === id ? updatedColumn : column
      ));
      return updatedColumn;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update column';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteColumn = async (id: number): Promise<void> => {
    try {
      setError(null);
      await columnAPI.deleteColumn(id);
      setColumns(prev => prev.filter(column => column.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete column';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const reorderColumns = async (boardId: number, columnIds: number[]): Promise<void> => {
    try {
      setError(null);
      await columnAPI.reorderColumns(boardId, columnIds);
      // Update local state to reflect new order
      setColumns(prev => {
        const reorderedColumns = columnIds.map(id => 
          prev.find(col => col.id === id)
        ).filter(Boolean) as Column[];
        return reorderedColumns;
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to reorder columns';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: ColumnContextType = {
    columns,
    loading,
    error,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
  };

  return (
    <ColumnContext.Provider value={value}>
      {children}
    </ColumnContext.Provider>
  );
};
