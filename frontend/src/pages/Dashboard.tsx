import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBoards } from '../contexts/BoardContext';
import { useTaskAssignment } from '../contexts/TaskAssignmentContext';
import type { Board, CreateBoardForm } from '../types';
import BoardCard from '../components/BoardCard';
import CreateBoardModal from '../components/CreateBoardModal';
import EditBoardModal from '../components/EditBoardModal';
import NotificationBell from '../components/NotificationBell';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    boards, 
    loading, 
    error, 
    fetchBoards, 
    createBoard, 
    updateBoard, 
    deleteBoard 
  } = useBoards();
  const { acceptTaskAssignment, rejectTaskAssignment } = useTaskAssignment();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (data: CreateBoardForm) => {
    setActionLoading(true);
    try {
      await createBoard(data);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBoard = async (id: number, data: CreateBoardForm) => {
    setActionLoading(true);
    try {
      await updateBoard(id, data);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoard = async (board: Board) => {
    if (window.confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        await deleteBoard(board.id);
      } catch (err) {
        console.error('Delete board error:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleEditClick = (board: Board) => {
    setSelectedBoard(board);
    setShowEditModal(true);
  };

  const handleRefresh = async () => {
    setActionLoading(true);
    try {
      await fetchBoards();
    } catch (error) {
      console.error('Failed to refresh boards:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Kanban Board</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell 
                onAcceptAssignment={acceptTaskAssignment}
                onRejectAssignment={rejectTaskAssignment}
              />
              <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Boards</h2>
              <p className="text-gray-600 mt-1">
                Manage your Kanban boards and collaborate with your team
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading || actionLoading}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                  actionLoading 
                    ? 'transform scale-95 shadow-lg ring-2 ring-indigo-200' 
                    : 'hover:shadow-md hover:scale-105'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                  (loading || actionLoading) 
                    ? 'animate-spin text-indigo-600' 
                    : 'hover:rotate-180'
                }`} />
                <span className={`transition-all duration-200 ${
                  actionLoading ? 'text-indigo-600 font-semibold' : ''
                }`}>
                  {actionLoading ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-90" />
                <span className="transition-all duration-200">Create Board</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && boards.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : boards.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No boards yet</h3>
              <p className="mt-2 text-gray-500">Get started by creating your first board.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first board
                </button>
              </div>
            </div>
          ) : (
            /* Boards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteBoard}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBoard}
        loading={actionLoading}
      />

      <EditBoardModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBoard(null);
        }}
        onSubmit={handleEditBoard}
        board={selectedBoard}
        loading={actionLoading}
      />
    </div>
  );
};

export default Dashboard;
