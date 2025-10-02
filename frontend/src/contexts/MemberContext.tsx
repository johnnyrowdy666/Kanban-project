import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Member } from '../types';
import { memberAPI } from '../services/api';

interface MemberContextType {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: (boardId: number) => Promise<void>;
  inviteMember: (boardId: number, email: string) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const useMembers = () => {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error('useMembers must be used within a MemberProvider');
  }
  return context;
};

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (boardId: number): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const response = await memberAPI.getMembers(boardId);
      setMembers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch members';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteMember = useCallback(async (boardId: number, email: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const response = await memberAPI.inviteMember(boardId, email);
      // Add the new member to the list
      setMembers(prev => [...prev, response.data]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to invite member';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (memberId: number): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await memberAPI.removeMember(memberId);
      // Remove the member from the list
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to remove member';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: MemberContextType = {
    members,
    loading,
    error,
    fetchMembers,
    inviteMember,
    removeMember,
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
};
