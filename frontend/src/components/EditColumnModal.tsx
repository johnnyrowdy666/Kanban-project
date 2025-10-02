import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import type { Column } from '../types';

interface EditColumnModalProps {
  column: Column | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: { name: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const EditColumnModal: React.FC<EditColumnModalProps> = ({
  column,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (column && isOpen) {
      setName(column.name);
      setError(null);
    }
  }, [column, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!column || !name.trim()) return;

    try {
      setError(null);
      await onSubmit(column.id, { name: name.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update column');
    }
  };

  const handleDelete = async () => {
    if (!column) return;

    const confirmMessage = `Are you sure you want to delete "${column.name}"? This will also delete all tasks in this column. This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsDeleting(true);
        setError(null);
        await onDelete(column.id);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to delete column');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClose = () => {
    if (!loading && !isDeleting) {
      setName('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !column) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-md w-full mx-4 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Column
          </h2>
          <button
            onClick={handleClose}
            disabled={loading || isDeleting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Column Name Input */}
          <div className="mb-6">
            <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-2">
              Column Name
            </label>
            <input
              type="text"
              id="columnName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter column name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading || isDeleting}
            />
          </div>

          {/* Task Count Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{column.tasks?.length || 0}</span> tasks in this column
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || isDeleting}
              className="flex items-center justify-center px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || isDeleting || !name.trim()}
              className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditColumnModal;
