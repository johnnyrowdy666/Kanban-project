import React from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import type { Task } from '../types';

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragStart: (event: DragStartEvent) => void;
  activeTask: Task | null;
}

const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onDragEnd,
  onDragOver,
  onDragStart,
  activeTask,
}) => {
  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={{
        duration: 300,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-400 p-4 w-80 transform rotate-3 scale-105 animate-pulse">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{activeTask.title}</h4>
                {activeTask.description && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {activeTask.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragDropProvider;
