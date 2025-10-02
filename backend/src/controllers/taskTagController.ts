import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const addTagToTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, tagId } = req.body;
    const userId = req.user!.userId;

    if (!taskId || !tagId) {
      return res.status(400).json({ error: 'Task ID and Tag ID are required' });
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

    // Check if tag exists and user has access to it
    const tag = await prisma.tag.findFirst({
      where: { 
        id: tagId,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if tag is already assigned to task
    const existingTaskTag = await prisma.taskTag.findFirst({
      where: {
        taskId,
        tagId
      }
    });

    if (existingTaskTag) {
      return res.status(409).json({ error: 'Tag is already assigned to this task' });
    }

    // Add tag to task
    const taskTag = await prisma.taskTag.create({
      data: {
        taskId,
        tagId
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
        },
        tag: true
      }
    });

    res.status(201).json(taskTag);
  } catch (error) {
    console.error('Add tag to task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeTagFromTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, tagId } = req.params;
    const userId = req.user!.userId;
    const taskIdNum = parseInt(taskId);
    const tagIdNum = parseInt(tagId);

    if (isNaN(taskIdNum) || isNaN(tagIdNum)) {
      return res.status(400).json({ error: 'Invalid task ID or tag ID' });
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskIdNum,
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

    // Check if task tag exists
    const taskTag = await prisma.taskTag.findFirst({
      where: {
        taskId: taskIdNum,
        tagId: tagIdNum
      }
    });

    if (!taskTag) {
      return res.status(404).json({ error: 'Tag is not assigned to this task' });
    }

    // Remove tag from task
    await prisma.taskTag.delete({
      where: { id: taskTag.id }
    });

    res.json({ message: 'Tag removed from task successfully' });
  } catch (error) {
    console.error('Remove tag from task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskTags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.userId;
    const taskIdNum = parseInt(taskId);

    if (isNaN(taskIdNum)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskIdNum,
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

    const taskTags = await prisma.taskTag.findMany({
      where: { taskId: taskIdNum },
      include: {
        tag: true
      },
      orderBy: { id: 'asc' }
    });

    res.json(taskTags);
  } catch (error) {
    console.error('Get task tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasksByTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tagId } = req.params;
    const userId = req.user!.userId;
    const tagIdNum = parseInt(tagId);

    if (isNaN(tagIdNum)) {
      return res.status(400).json({ error: 'Invalid tag ID' });
    }

    // Check if tag exists and user has access to it
    const tag = await prisma.tag.findFirst({
      where: { 
        id: tagIdNum,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const taskTags = await prisma.taskTag.findMany({
      where: { tagId: tagIdNum },
      include: {
        task: {
          include: {
            column: {
              select: {
                name: true,
                board: {
                  select: {
                    id: true,
                    name: true,
                    ownerId: true,
                    members: {
                      select: {
                        userId: true
                      }
                    }
                  }
                }
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // Filter tasks that user has access to
    const accessibleTasks = taskTags.filter((taskTag: any) => {
      const board = taskTag.task.column.board;
      return board.ownerId === userId || 
             board.members?.some((member: any) => member.userId === userId);
    });

    res.json(accessibleTasks.map((taskTag: any) => taskTag.task));
  } catch (error) {
    console.error('Get tasks by tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
