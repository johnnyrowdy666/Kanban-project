import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, columnId, position } = req.body;
    const userId = req.user!.userId;

    if (!title || !columnId) {
      return res.status(400).json({ error: 'Task title and column ID are required' });
    }

    // Check if user has access to the column's board
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        board: true
      }
    });

    if (!column) {
      return res.status(404).json({ error: 'Column not found or access denied' });
    }

    // Get the highest position in the column
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' }
    });

    const taskPosition = position || (lastTask ? lastTask.position + 1 : 1);

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        position: taskPosition,
        columnId,
        createdBy: userId,
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            boardId: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        },
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasksByColumn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.userId;
    const columnIdNum = parseInt(columnId);

    if (isNaN(columnIdNum)) {
      return res.status(400).json({ error: 'Invalid column ID' });
    }

    // Check if user has access to the column's board
    const column = await prisma.column.findFirst({
      where: {
        id: columnIdNum,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!column) {
      return res.status(404).json({ error: 'Column not found or access denied' });
    }

    const tasks = await prisma.task.findMany({
      where: { columnId: columnIdNum },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            boardId: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        },
        taskTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { position: 'asc' }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } }
            ]
          }
        }
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            boardId: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        },
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, position } = req.body;
    const userId = req.user!.userId;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const updateData: any = { title };
    if (description !== undefined) updateData.description = description;
    if (position !== undefined) updateData.position = position;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        column: {
          select: {
            id: true,
            name: true,
            boardId: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        },
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const moveTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { columnId, position } = req.body;
    const userId = req.user!.userId;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!columnId || position === undefined) {
      return res.status(400).json({ error: 'Column ID and position are required' });
    }

    // Check if user has access to both source and destination columns
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const destinationColumn = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!destinationColumn) {
      return res.status(404).json({ error: 'Destination column not found or access denied' });
    }

    // If moving to a different column, update positions of existing tasks
    if (task.columnId !== columnId) {
      console.log(`Moving task ${taskId} from column ${task.columnId} to column ${columnId}`);
      
      // Get current tasks in destination column
      const existingTasks = await prisma.task.findMany({
        where: { columnId },
        orderBy: { position: 'asc' }
      });
      console.log(`Existing tasks in column ${columnId}:`, existingTasks.map((t: any) => ({ id: t.id, title: t.title, position: t.position })));
      
      // Increment positions of all tasks in the destination column
      await prisma.task.updateMany({
        where: { columnId },
        data: { position: { increment: 1 } }
      });
      console.log(`Incremented positions of tasks in column ${columnId}`);
    }

    // Update task position and column
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId,
        position: 1, // Always place at the top
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            boardId: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        },
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json({
      message: 'Task moved successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reorderTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { columnId } = req.params;
    const { taskIds } = req.body;
    const userId = req.user!.userId;
    const columnIdNum = parseInt(columnId);

    if (isNaN(columnIdNum)) {
      return res.status(400).json({ error: 'Invalid column ID' });
    }

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'Task IDs must be an array' });
    }

    // Check if user has access to the column
    const column = await prisma.column.findFirst({
      where: {
        id: columnIdNum,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!column) {
      return res.status(404).json({ error: 'Column not found or access denied' });
    }

    // Update task positions
    const updatePromises = taskIds.map((taskId: number, index: number) => 
      prisma.task.update({
        where: { id: taskId },
        data: { position: index + 1 }
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
