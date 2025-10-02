import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const assignTaskMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, userId } = req.body;
    const currentUserId = req.user!.userId;

    if (!taskId || !userId) {
      return res.status(400).json({ error: 'Task ID and User ID are required' });
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          board: {
            OR: [
              { ownerId: currentUserId },
              { members: { some: { userId: currentUserId } } }
            ]
          }
        }
      },
      include: {
        column: {
          include: {
            board: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Check if user to assign is a member of the board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: task.column.board.id,
        userId
      }
    });

    if (!boardMember) {
      return res.status(400).json({ error: 'User is not a member of this board' });
    }

    // Check if user is already assigned to the task
    const existingAssignment = await prisma.taskMember.findFirst({
      where: {
        taskId,
        userId
      }
    });

    if (existingAssignment) {
      return res.status(409).json({ error: 'User is already assigned to this task' });
    }

    // Assign user to task
    const taskMember = await prisma.taskMember.create({
      data: {
        taskId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
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

    // Create notification for the assigned user
    await prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNMENT',
        title: 'Task Assignment',
        message: `You have been assigned to the task "${task.title}" in ${task.column.board.name}`,
        userId
      }
    });

    res.status(201).json({
      message: 'User assigned to task successfully',
      assignment: taskMember,
    });
  } catch (error) {
    console.error('Assign task member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskMembers = async (req: AuthenticatedRequest, res: Response) => {
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

    const taskMembers = await prisma.taskMember.findMany({
      where: { taskId: taskIdNum },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    res.json({ taskMembers });
  } catch (error) {
    console.error('Get task members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeTaskMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, memberId } = req.params;
    const userId = req.user!.userId;
    const taskIdNum = parseInt(taskId);
    const memberIdNum = parseInt(memberId);

    if (isNaN(taskIdNum) || isNaN(memberIdNum)) {
      return res.status(400).json({ error: 'Invalid task ID or member ID' });
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

    // Check if assignment exists
    const assignment = await prisma.taskMember.findFirst({
      where: {
        taskId: taskIdNum,
        userId: memberIdNum
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Remove assignment
    await prisma.taskMember.delete({
      where: { id: assignment.id }
    });

    res.json({ message: 'User removed from task successfully' });
  } catch (error) {
    console.error('Remove task member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
