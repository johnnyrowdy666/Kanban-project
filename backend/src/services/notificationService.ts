import { prisma } from '../database';

export interface CreateNotificationData {
  type?: string;
  title: string;
  message: string;
  userId: number;
  taskId?: number;
  data?: any;
}

export const createNotification = async (data: CreateNotificationData) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type || 'GENERAL',
        title: data.title,
        message: data.message,
        data: data.data || null,
        userId: data.userId,
        taskId: data.taskId || null
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            column: {
              select: {
                name: true,
                board: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const createBoardInviteNotification = async (boardId: number, userId: number) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { name: true }
    });

    if (!board) {
      throw new Error('Board not found');
    }

    return await createNotification({
      title: 'Board Invitation',
      message: `You have been invited to join the board "${board.name}"`,
      userId
    });
  } catch (error) {
    console.error('Create board invite notification error:', error);
    throw error;
  }
};

export const createTaskAssignmentNotification = async (taskId: number, userId: number) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            name: true,
            board: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return await createNotification({
      title: 'Task Assignment',
      message: `You have been assigned to the task "${task.title}" in ${task.column.board.name}`,
      userId,
      taskId
    });
  } catch (error) {
    console.error('Create task assignment notification error:', error);
    throw error;
  }
};

export const createTaskUpdateNotification = async (taskId: number, userId: number, updateType: string) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            name: true,
            board: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    let message = '';
    switch (updateType) {
      case 'created':
        message = `A new task "${task.title}" has been created in ${task.column.board.name}`;
        break;
      case 'updated':
        message = `The task "${task.title}" has been updated in ${task.column.board.name}`;
        break;
      case 'moved':
        message = `The task "${task.title}" has been moved to ${task.column.name} in ${task.column.board.name}`;
        break;
      case 'deleted':
        message = `The task "${task.title}" has been deleted from ${task.column.board.name}`;
        break;
      default:
        message = `The task "${task.title}" has been ${updateType} in ${task.column.board.name}`;
    }

    return await createNotification({
      title: 'Task Update',
      message,
      userId,
      taskId
    });
  } catch (error) {
    console.error('Create task update notification error:', error);
    throw error;
  }
};

export const createBoardUpdateNotification = async (boardId: number, userId: number, updateType: string) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { name: true }
    });

    if (!board) {
      throw new Error('Board not found');
    }

    let message = '';
    switch (updateType) {
      case 'created':
        message = `A new board "${board.name}" has been created`;
        break;
      case 'updated':
        message = `The board "${board.name}" has been updated`;
        break;
      case 'deleted':
        message = `The board "${board.name}" has been deleted`;
        break;
      default:
        message = `The board "${board.name}" has been ${updateType}`;
    }

    return await createNotification({
      title: 'Board Update',
      message,
      userId
    });
  } catch (error) {
    console.error('Create board update notification error:', error);
    throw error;
  }
};
