import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useTags } from '../contexts/TagContext';
import { useTaskTags } from '../contexts/TaskTagContext';
import type { Task } from '../types';

interface TaskTagSelectorProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskTagSelector: React.FC<TaskTagSelectorProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { tags, fetchTags } = useTags();
  const { addTagToTask, removeTagFromTask, getTagsByTask, fetchTaskTags } = useTaskTags();
  const [loading, setLoading] = useState(false);

  const taskTagsForTask = getTagsByTask(task.id);
  const availableTags = tags.filter(tag => 
    !taskTagsForTask.some(tt => tt.tagId === tag.id)
  );

  useEffect(() => {
    if (isOpen && task.column?.boardId) {
      fetchTags(task.column.boardId);
      fetchTaskTags(task.id);
    }
  }, [isOpen, task.column?.boardId, fetchTags, fetchTaskTags, task.id]);

  const handleAddTag = async (tagId: number) => {
    try {
      setLoading(true);
      await addTagToTask(task.id, tagId);
      // Refresh task tags after adding
      await fetchTaskTags(task.id);
    } catch (error) {
      console.error('Failed to add tag to task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      setLoading(true);
      await removeTagFromTask(task.id, tagId);
      // Refresh task tags after removing
      await fetchTaskTags(task.id);
    } catch (error) {
      console.error('Failed to remove tag from task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TagIcon className="w-5 h-5 mr-2" />
            Tags for "{task.title}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Current Tags */}
          {taskTagsForTask.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Tags</h4>
              <div className="space-y-2">
                {taskTagsForTask.map((taskTag) => {
                  const tag = tags.find(t => t.id === taskTag.tagId);
                  if (!tag) return null;
                  
                  return (
                    <div
                      key={taskTag.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {tag.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        disabled={loading}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Tags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Available Tags
            </h4>
            {availableTags.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <TagIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No available tags</p>
                <p className="text-xs">Create tags in the board settings</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {tag.name}
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTagSelector;
