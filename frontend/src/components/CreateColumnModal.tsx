import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateColumnForm, Column } from '../types';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  onSubmit: (column: Column) => void;
  loading?: boolean;
}

const CreateColumnModal: React.FC<CreateColumnModalProps> = ({ 
  isOpen, 
  onClose, 
  boardId,
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<CreateColumnForm>({
    name: '',
    boardId,
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Column name is required');
      return;
    }

    try {
      // TODO: Call API to create column
      // For now, just close the modal
      console.log('Creating column:', formData);
      onSubmit(formData as any); // Temporary fix for unused parameter
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create column');
    }
  };

  const handleClose = () => {
    setFormData({ 
      name: '', 
      boardId 
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl w-96 mx-4 border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Create New Column
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Column Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter column name (e.g., Todo, In Progress, Done)"
                autoFocus
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Column'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateColumnModal;
