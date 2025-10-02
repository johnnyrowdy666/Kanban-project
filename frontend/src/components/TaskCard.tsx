import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Edit2, Trash2, User, Tag, Users } from 'lucide-react';
import type { Task } from '../types';
import TaskTagSelector from './TaskTagSelector';
import TaskAssignmentModal from './TaskAssignmentModal';
import { useTaskTags } from '../contexts/TaskTagContext';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate: _onUpdate, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const { getTagsByTask } = useTaskTags();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border-2 p-4 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 rotate-2' : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
      }`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div
          {...attributes}
          {...listeners}
          className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 cursor-grab active:cursor-grabbing hover:text-blue-600 transition-colors duration-200"
        >
          {task.title}
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Task
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTagSelector(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Manage Tags
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAssignmentModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Assignments
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Tags */}
      {(() => {
        const taskTags = getTagsByTask(task.id);
        return taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {taskTags.slice(0, 3).map((taskTag) => (
              <span
                key={taskTag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${taskTag.tag.color}20`,
                  color: taskTag.tag.color 
                }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {taskTag.tag.name}
              </span>
            ))}
            {taskTags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{taskTags.length - 3} more
              </span>
            )}
          </div>
        );
      })()}

      {/* Task Members */}
      {task.members && task.members.length > 0 && (
        <div className="flex items-center space-x-1 mb-3">
          <User className="w-4 h-4 text-gray-400" />
          <div className="flex -space-x-1">
            {task.members
              .filter(member => member.status === 'ACCEPTED')
              .slice(0, 3)
              .map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={`${member.user.username} (Accepted)`}
                >
                  {member.user.username.charAt(0).toUpperCase()}
                </div>
              ))}
            {task.members.filter(member => member.status === 'ACCEPTED').length > 3 && (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                +{task.members.filter(member => member.status === 'ACCEPTED').length - 3}
              </div>
            )}
          </div>
          {task.members.some(member => member.status === 'PENDING') && (
            <div className="flex items-center space-x-1 ml-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Pending assignments"></div>
              <span className="text-xs text-yellow-600 font-medium">
                {task.members.filter(member => member.status === 'PENDING').length} pending
              </span>
            </div>
          )}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created {formatDate(task.createdAt)}</span>
        {task.creator && (
          <span>by {task.creator.username}</span>
        )}
      </div>

      {/* Task Tag Selector Modal */}
      <TaskTagSelector
        task={task}
        isOpen={showTagSelector}
        onClose={() => setShowTagSelector(false)}
      />

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        task={task}
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
      />
    </div>
  );
};

export default TaskCard;
