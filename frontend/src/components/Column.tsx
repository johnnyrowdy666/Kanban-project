import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Column, Task } from '../types';
import { useTasks } from '../contexts/TaskContext';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';

interface ColumnProps {
  column: Column;
  tasks: Task[];
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (column: Column) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onEditColumn,
  onDeleteColumn,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit: _onTaskEdit,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { createTask, updateTask } = useTasks();

  // Droppable for tasks
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  // Sortable for column reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleTaskCreate = async (data: { title: string; description?: string }) => {
    try {
      await createTask({
        title: data.title,
        description: data.description,
        columnId: column.id,
        position: tasks.length + 1,
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleTaskUpdate = async (task: Task) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
      });
      onTaskUpdate(task);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div 
      ref={setDroppableRef}
      className={`rounded-lg p-4 min-h-[500px] w-80 flex flex-col transition-all duration-300 ${
        isOver 
          ? 'bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-400 shadow-xl scale-105' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          ref={setSortableRef}
          style={style}
          {...attributes}
          {...listeners}
          className={`flex items-center space-x-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200 ${
            isDragging ? 'opacity-50' : ''
          }`}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">{column.name}</h3>
          <span className="bg-gray-300 text-gray-700 text-sm px-2 py-1 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        
        <div className="relative group">
          <button 
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-200"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditColumn(column);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Column
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteColumn(column);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Column
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto">
        <SortableContext items={tasks.map(task => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[200px]">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
                onEdit={handleTaskEdit}
              />
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Add a task to get started</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <div className="mt-4">
        <button
          onClick={handleCreateTask}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        columnId={column.id}
        onSubmit={handleTaskCreate}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSubmit={handleTaskUpdate}
      />
    </div>
  );
};

export default Column;
