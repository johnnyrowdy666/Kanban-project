import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { useTags } from '../contexts/TagContext';
import type { Tag } from '../types';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
}

const TAG_COLORS = [
  { name: 'Red', value: '#ef4444', bg: 'bg-red-100', text: 'text-red-800' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-100', text: 'text-orange-800' },
  { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { name: 'Green', value: '#22c55e', bg: 'bg-green-100', text: 'text-green-800' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-800' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-100', text: 'text-purple-800' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-100', text: 'text-pink-800' },
  { name: 'Gray', value: '#6b7280', bg: 'bg-gray-100', text: 'text-gray-800' },
];

const TagManagementModal: React.FC<TagManagementModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const { tags, loading, error, fetchTags, createTag, updateTag, deleteTag } = useTags();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: TAG_COLORS[0].value,
  });

  useEffect(() => {
    if (isOpen && boardId) {
      fetchTags(boardId);
    }
  }, [isOpen, boardId, fetchTags]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createTag({
        name: formData.name.trim(),
        color: formData.color,
        boardId,
      });
      setFormData({ name: '', color: TAG_COLORS[0].value });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !formData.name.trim()) return;

    try {
      await updateTag(editingTag.id, {
        name: formData.name.trim(),
        color: formData.color,
      });
      setEditingTag(null);
      setFormData({ name: '', color: TAG_COLORS[0].value });
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      try {
        await deleteTag(tag.id);
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setShowCreateForm(false);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingTag(null);
    setFormData({ name: '', color: TAG_COLORS[0].value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TagIcon className="w-5 h-5 mr-2" />
            Manage Tags
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editingTag) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h3>
              <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tag name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          className={`p-3 rounded-md border-2 transition-all ${
                            formData.color === color.value
                              ? 'border-gray-400 scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full mx-auto"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingTag ? 'Update Tag' : 'Create Tag'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tags List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              {!showCreateForm && !editingTag && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tag
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading tags...</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TagIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No tags created yet</p>
                <p className="text-sm">Create your first tag to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTag(tag)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;
