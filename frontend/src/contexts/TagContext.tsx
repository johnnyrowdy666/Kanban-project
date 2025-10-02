import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Tag } from '../types';
import { tagAPI } from '../services/api';

interface TagContextType {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: (boardId: number) => Promise<void>;
  createTag: (data: { name: string; color: string; boardId: number }) => Promise<Tag>;
  updateTag: (id: number, data: { name: string; color: string }) => Promise<Tag>;
  deleteTag: (id: number) => Promise<void>;
  getTagsByBoard: (boardId: number) => Tag[];
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const useTags = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};

interface TagProviderProps {
  children: ReactNode;
}

export const TagProvider: React.FC<TagProviderProps> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async (boardId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await tagAPI.getTagsByBoard(boardId);
      setTags(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch tags';
      setError(errorMessage);
      console.error('Fetch tags error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (data: { name: string; color: string; boardId: number }): Promise<Tag> => {
    try {
      setError(null);
      const response = await tagAPI.createTag(data);
      const newTag = response.data;
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create tag';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateTag = useCallback(async (id: number, data: { name: string; color: string }): Promise<Tag> => {
    try {
      setError(null);
      const response = await tagAPI.updateTag(id, data);
      const updatedTag = response.data;
      setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
      return updatedTag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update tag';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTag = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await tagAPI.deleteTag(id);
      setTags(prev => prev.filter(tag => tag.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete tag';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getTagsByBoard = useCallback((boardId: number): Tag[] => {
    return tags.filter(tag => tag.boardId === boardId);
  }, [tags]);

  const value: TagContextType = {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagsByBoard,
  };

  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};
