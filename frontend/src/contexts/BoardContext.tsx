import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Board, CreateBoardForm } from '../types';
import { boardAPI } from '../services/api';

interface BoardContextType {
  boards: Board[];
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  createBoard: (data: CreateBoardForm) => Promise<Board>;
  updateBoard: (id: number, data: CreateBoardForm) => Promise<Board>;
  deleteBoard: (id: number) => Promise<void>;
  getBoardById: (id: number) => Board | undefined;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoards = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoards must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardAPI.getBoards();
      setBoards(response.data.boards);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch boards');
      console.error('Fetch boards error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = async (data: CreateBoardForm): Promise<Board> => {
    try {
      setError(null);
      const response = await boardAPI.createBoard(data);
      const newBoard = response.data.board;
      setBoards(prev => [newBoard, ...prev]);
      return newBoard;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create board';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateBoard = async (id: number, data: CreateBoardForm): Promise<Board> => {
    try {
      setError(null);
      const response = await boardAPI.updateBoard(id, data);
      const updatedBoard = response.data.board;
      setBoards(prev => prev.map(board => 
        board.id === id ? updatedBoard : board
      ));
      return updatedBoard;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update board';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteBoard = async (id: number): Promise<void> => {
    try {
      setError(null);
      await boardAPI.deleteBoard(id);
      setBoards(prev => prev.filter(board => board.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete board';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getBoardById = (id: number): Board | undefined => {
    return boards.find(board => board.id === id);
  };

  // Removed automatic fetchBoards to prevent infinite loop
  // Boards will be fetched when Dashboard component mounts

  const value: BoardContextType = {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    getBoardById,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};
