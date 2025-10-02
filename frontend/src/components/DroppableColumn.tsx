import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column, Task } from '../types';
import SortableTaskList from './SortableTaskList';

interface DroppableColumnProps {
  column: Column;
  tasks: Task[];
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (column: Column) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onCreateTask: () => void;
}

const Column: React.FC<DroppableColumnProps> = ({
  column,
  tasks,
  onEditColumn,
  onDeleteColumn,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onCreateTask,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

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

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-lg p-4 min-h-[500px] w-80 flex flex-col transition-colors duration-200 ${
        isOver ? 'bg-blue-100' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          ref={setSortableRef}
          style={style}
          {...attributes}
          {...listeners}
          className={`flex items-center space-x-2 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
        >
          <h3 className="font-semibold text-gray-900 text-lg">{column.name}</h3>
          <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-full">
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Column
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteColumn(column);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Column
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length > 0 ? (
          <SortableContext items={tasks.map(task => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
            <SortableTaskList
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
              onTaskEdit={onTaskEdit}
            />
          </SortableContext>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Add a task to get started</p>
          </div>
        )}
        
        {/* Drop zone for empty area when column has tasks */}
        {tasks.length > 0 && (
          <div className="h-4 w-full" />
        )}
        
        {/* Additional drop zone at the bottom */}
        <div className="h-2 w-full" />
      </div>

      {/* Add Task Button */}
      <div className="mt-4">
        <button
          onClick={onCreateTask}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
};

export default Column;
