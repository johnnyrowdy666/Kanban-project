import React from 'react';
import { Link } from 'react-router-dom';
import type { Board } from '../types';
import { Users, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalTasks = () => {
    return board.columns.reduce((total, column) => total + column.tasks.length, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:scale-105 hover:border-indigo-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
              {board.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Created {formatDate(board.createdAt)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span>{board.members.length + 1} member{board.members.length + 1 !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="relative group/menu">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all duration-200 hover:scale-110 group-hover/menu:bg-gray-100">
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200">
              <div className="py-1">
                <button
                  onClick={() => onEdit(board)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Board
                </button>
                <button
                  onClick={() => onDelete(board)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Board
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Columns: {board.columns.length}</span>
            <span>Tasks: {getTotalTasks()}</span>
          </div>
          
          {/* Progress bar showing task distribution */}
          <div className="w-full bg-gray-200 rounded-full h-2 group-hover:bg-gray-300 transition-colors duration-200">
            <div className="flex h-2 rounded-full overflow-hidden">
              {board.columns.map((column, index) => {
                const percentage = getTotalTasks() > 0 
                  ? (column.tasks.length / getTotalTasks()) * 100 
                  : 0;
                const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <div
                    key={column.id}
                    className={`${colors[index % colors.length]} transition-all duration-500 group-hover:shadow-sm`}
                    style={{ width: `${percentage}%` }}
                    title={`${column.name}: ${column.tasks.length} tasks`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Owner: <span className="font-medium">{board.owner.username}</span>
          </div>
          
          <Link
            to={`/board/${board.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 group-hover:bg-indigo-700"
          >
            <span className="transition-all duration-200 group-hover:font-semibold">Open Board</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BoardCard;
