import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, AlertCircle, Tag, Users } from 'lucide-react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useAuth } from '../contexts/AuthContext';
import { useBoards } from '../contexts/BoardContext';
import { useColumns } from '../contexts/ColumnContext';
import { useTasks } from '../contexts/TaskContext';
import type { Board, Column as ColumnType, Task } from '../types';
import DragDropProvider from '../components/DragDropProvider';
import Column from '../components/Column';
import CreateColumnModal from '../components/CreateColumnModal';
import EditColumnModal from '../components/EditColumnModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TagManagementModal from '../components/TagManagementModal';
import MemberManagementModal from '../components/MemberManagementModal';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

const Board: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { getBoardById } = useBoards();
  const { 
    columns, 
    loading: columnsLoading, 
    error: columnsError, 
    fetchColumns, 
    createColumn, 
    updateColumn, 
    deleteColumn,
    reorderColumns
  } = useColumns();
  const { 
    tasks, 
    error: tasksError, 
    createTask,
    deleteTask,
    moveTask,
    reorderTasks,
    getTasksByColumn,
    fetchTasksByColumn,
    setTasks
  } = useTasks();

  const [board, setBoard] = useState<Board | null>(null);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [showEditColumnModal, setShowEditColumnModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTagManagementModal, setShowTagManagementModal] = useState(false);
  const [showMemberManagementModal, setShowMemberManagementModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<ColumnType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const boardId = useMemo(() => {
    return id ? parseInt(id) : null;
  }, [id]);

  const fetchColumnsCallback = useCallback((boardId: number) => {
    fetchColumns(boardId);
  }, [fetchColumns]);

  useEffect(() => {
    if (boardId) {
      const boardData = getBoardById(boardId);
      if (boardData) {
        setBoard(boardData);
        fetchColumnsCallback(boardId);
      }
    }
  }, [boardId, fetchColumnsCallback]);

  // Fetch tasks when columns change
  useEffect(() => {
    if (columns.length > 0) {
      columns.forEach(column => {
        fetchTasksByColumn(column.id);
      });
    }
  }, [columns.length, fetchTasksByColumn]);

  const handleCreateColumn = async (data: { name: string; boardId: number }) => {
    setActionLoading(true);
    try {
      await createColumn(data);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditColumn = async (column: ColumnType) => {
    setSelectedColumn(column);
    setShowEditColumnModal(true);
  };

  const handleUpdateColumn = async (id: number, data: { name: string }) => {
    setActionLoading(true);
    try {
      await updateColumn(id, data);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteColumn = async (column: ColumnType) => {
    setActionLoading(true);
    try {
      await deleteColumn(column.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskUpdate = async (task: Task) => {
    // Task update is handled in Column component
    console.log('Task updated:', task);
  };

  const handleTaskEdit = async (task: Task) => {
    // Task edit is handled in Column component
    console.log('Edit task:', task);
  };

  const handleCreateTask = async (data: { title: string; description?: string }) => {
    if (!selectedColumnId) return;
    
    setActionLoading(true);
    try {
      await createTask({
        ...data,
        columnId: selectedColumnId,
        position: 0
      });
      // Don't call fetchTasksByColumn here as createTask already updates the state
    } finally {
      setActionLoading(false);
    }
  };


      // Drag & Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id.toString().replace('task-', '');
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
      setActiveTask(task);
      // Immediately remove task from original column for better UX
      setTasks(prev => prev.filter(t => t.id !== task.id));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    console.log('Drag Over:', { activeId, overId, overData: over.data?.current });
    
    // Handle cross-column drag over
    if (activeId.startsWith('task-') && overId.startsWith('column-')) {
      const taskId = activeId.replace('task-', '');
      const columnId = overId.replace('column-', '');
      
      const task = tasks.find(t => t.id === parseInt(taskId));
      const targetColumnId = parseInt(columnId);
      
      console.log('Cross-column drag over:', { task, targetColumnId });
      
      if (task && task.columnId !== targetColumnId) {
        // Visual feedback - the actual move will happen in handleDragEnd
        console.log(`Task ${task.id} hovering over column ${targetColumnId}`);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    const activeId = active.id.toString();
    const draggedTask = activeTask; // Use activeTask instead of searching in tasks
    
    setActiveTask(null);
    
    // If no valid drop target, restore the task to its original position
    if (!over || !draggedTask) {
      if (draggedTask) {
        setTasks(prev => [...prev, draggedTask]);
      }
      return;
    }
    
    const overId = over.id.toString();
    
    console.log('Drag End:', { activeId, overId, overData: over.data?.current });
    
    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');
      
      const activeColumn = columns.find(c => c.id === parseInt(activeColumnId));
      const overColumn = columns.find(c => c.id === parseInt(overColumnId));
      
      console.log('Column reordering:', { activeColumn, overColumn });
      
      if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
        const activeIndex = columns.findIndex(c => c.id === activeColumn.id);
        const overIndex = columns.findIndex(c => c.id === overColumn.id);
        
        if (activeIndex !== overIndex) {
          const newOrder = [...columns];
          const [removed] = newOrder.splice(activeIndex, 1);
          newOrder.splice(overIndex, 0, removed);
          
          const reorderedColumnIds = newOrder.map(c => c.id);
          console.log('Reordering columns:', reorderedColumnIds);
          try {
            await reorderColumns(board!.id, reorderedColumnIds);
            console.log('Columns reordered successfully');
          } catch (error) {
            console.error('Failed to reorder columns:', error);
          }
        }
      }
    }
    // Handle cross-column drag (task to column)
    else if (activeId.startsWith('task-') && overId.startsWith('column-')) {
      const columnId = overId.replace('column-', '');
      const targetColumnId = parseInt(columnId);
      
      console.log('Cross-column drag (task to column):', { draggedTask, targetColumnId });
      
      if (draggedTask && draggedTask.columnId !== targetColumnId) {
        try {
          console.log(`Moving task ${draggedTask.id} from column ${draggedTask.columnId} to column ${targetColumnId}`);
          const movedTask = await moveTask(draggedTask.id, targetColumnId, 1);
          console.log('Task moved successfully');
          // Add the moved task back to the tasks list
          setTasks(prev => [...prev, movedTask]);
        } catch (error) {
          console.error('Failed to move task:', error);
          // Restore task on error
          setTasks(prev => [...prev, draggedTask]);
        }
      } else if (draggedTask) {
        // Restore task if no valid move
        setTasks(prev => [...prev, draggedTask]);
      }
    }
    // Handle cross-column drag using data
    else if (activeId.startsWith('task-') && over?.data?.current?.type === 'column') {
      const targetColumnId = over.data.current.columnId;
      
      console.log('Cross-column drag (data):', { draggedTask, targetColumnId });
      
      if (draggedTask && draggedTask.columnId !== targetColumnId) {
        try {
          console.log(`Moving task ${draggedTask.id} from column ${draggedTask.columnId} to column ${targetColumnId}`);
          const movedTask = await moveTask(draggedTask.id, targetColumnId, 1);
          console.log('Task moved successfully');
          // Add the moved task back to the tasks list
          setTasks(prev => [...prev, movedTask]);
        } catch (error) {
          console.error('Failed to move task:', error);
          // Restore task on error
          setTasks(prev => [...prev, draggedTask]);
        }
      } else if (draggedTask) {
        // Restore task if no valid move
        setTasks(prev => [...prev, draggedTask]);
      }
    }
    // Handle cross-column drag using task-list data
    else if (activeId.startsWith('task-') && over?.data?.current?.type === 'task-list') {
      const targetColumnId = over.data.current.columnId;
      
      console.log('Cross-column drag (task-list):', { draggedTask, targetColumnId });
      
      if (draggedTask && draggedTask.columnId !== targetColumnId) {
        try {
          console.log(`Moving task ${draggedTask.id} from column ${draggedTask.columnId} to column ${targetColumnId}`);
          const movedTask = await moveTask(draggedTask.id, targetColumnId, 1);
          console.log('Task moved successfully');
          // Add the moved task back to the tasks list
          setTasks(prev => [...prev, movedTask]);
        } catch (error) {
          console.error('Failed to move task:', error);
          // Restore task on error
          setTasks(prev => [...prev, draggedTask]);
        }
      } else if (draggedTask) {
        // Restore task if no valid move
        setTasks(prev => [...prev, draggedTask]);
      }
    }
    // Handle task to task drag (both same column and cross-column)
    else if (activeId.startsWith('task-') && overId.startsWith('task-')) {
      const overTaskId = overId.replace('task-', '');
      
      // Find overTask from tasks (it should still exist)
      const overTask = tasks.find(t => t.id === parseInt(overTaskId));
      
      console.log('Task to task drag:', { draggedTask, overTask });
      
      if (draggedTask && overTask) {
        // Check if same column or different column
        if (draggedTask.columnId === overTask.columnId) {
          // Same column reordering
          // Get all tasks including the dragged one
          const columnTasks = [...tasks, draggedTask]
            .filter(t => t.columnId === draggedTask.columnId)
            .sort((a, b) => a.position - b.position);
          
          const activeIndex = columnTasks.findIndex(t => t.id === draggedTask.id);
          const overIndex = columnTasks.findIndex(t => t.id === overTask.id);
          
          console.log('Same column reordering - Indices:', { activeIndex, overIndex });
          
          if (activeIndex !== overIndex) {
            // Create new order
            const newOrder = [...columnTasks];
            const [removed] = newOrder.splice(activeIndex, 1);
            newOrder.splice(overIndex, 0, removed);
            
            // Update positions
            const reorderedTaskIds = newOrder.map(t => t.id);
            console.log('Reordering tasks:', reorderedTaskIds);
            try {
              await reorderTasks(draggedTask.columnId, reorderedTaskIds);
              console.log('Tasks reordered successfully');
            } catch (error) {
              console.error('Failed to reorder tasks:', error);
              // Restore task on error
              setTasks(prev => [...prev, draggedTask]);
            }
          } else {
            // No reordering needed, restore task
            setTasks(prev => [...prev, draggedTask]);
          }
        } else {
          // Cross-column drag (task dropped on task in different column)
          console.log('Cross-column drag (task to task):', { 
            activeTaskId: draggedTask.id, 
            targetColumnId: overTask.columnId 
          });
          
          try {
            console.log(`Moving task ${draggedTask.id} from column ${draggedTask.columnId} to column ${overTask.columnId}`);
            const movedTask = await moveTask(draggedTask.id, overTask.columnId, 1);
            console.log('Task moved successfully');
            // Add the moved task back to the tasks list
            setTasks(prev => [...prev, movedTask]);
          } catch (error) {
            console.error('Failed to move task:', error);
            // Restore task on error
            setTasks(prev => [...prev, draggedTask]);
          }
        }
      }
    }
  };

  const handleTaskDelete = async (task: Task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      setActionLoading(true);
      try {
        await deleteTask(task.id);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchColumns(parseInt(id));
    }
  };

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Board not found</h2>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      activeTask={activeTask}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{board.name}</h1>
                  <p className="text-sm text-gray-500">
                    {columns.length} columns • {tasks.length} tasks
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
              <p className="text-gray-600 mt-1">
                Manage your tasks and collaborate with your team
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={columnsLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${columnsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowTagManagementModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Tag className="w-4 h-4 mr-2" />
                Manage Tags
              </button>
              <button
                onClick={() => setShowMemberManagementModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </button>
              <button
                onClick={() => setShowCreateColumnModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {(columnsError || tasksError) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {columnsError || tasksError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {columnsLoading && columns.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : columns.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No columns yet</h3>
              <p className="mt-2 text-gray-500">Get started by creating your first column.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateColumnModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first column
                </button>
              </div>
            </div>
          ) : (
            /* Columns Grid */
            <div className="flex space-x-6 overflow-x-auto pb-4">
              <SortableContext items={columns.map(col => `column-${col.id}`)} strategy={horizontalListSortingStrategy}>
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={getTasksByColumn(column.id)}
                    onEditColumn={handleEditColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                    onTaskEdit={handleTaskEdit}
                  />
                ))}
              </SortableContext>
            </div>
          )}
        </div>
      </div>

      {/* Create Column Modal */}
      <CreateColumnModal
        isOpen={showCreateColumnModal}
        onClose={() => setShowCreateColumnModal(false)}
        boardId={board.id}
        onSubmit={handleCreateColumn}
        loading={actionLoading}
      />

      {/* Create Task Modal */}
      {selectedColumnId && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => {
            setShowCreateTaskModal(false);
            setSelectedColumnId(null);
          }}
          columnId={selectedColumnId}
          onSubmit={handleCreateTask}
          loading={actionLoading}
        />
      )}

      {/* Tag Management Modal */}
      {board && (
        <TagManagementModal
          isOpen={showTagManagementModal}
          onClose={() => setShowTagManagementModal(false)}
          boardId={board.id}
        />
      )}

      {/* Edit Column Modal */}
      <EditColumnModal
        column={selectedColumn}
        isOpen={showEditColumnModal}
        onClose={() => {
          setShowEditColumnModal(false);
          setSelectedColumn(null);
        }}
        onSubmit={handleUpdateColumn}
        onDelete={(id) => handleDeleteColumn({ id } as ColumnType)}
        loading={actionLoading}
      />

      {/* Member Management Modal */}
      {board && (
        <MemberManagementModal
          isOpen={showMemberManagementModal}
          onClose={() => setShowMemberManagementModal(false)}
          board={board}
        />
      )}
      </div>
    </DragDropProvider>
  );
};

export default Board;
