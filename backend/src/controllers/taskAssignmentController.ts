import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Assign user to task (with notification)
export const assignUserToTask = async (req: Request, res: Response) => {
  try {
    const { taskId, userId } = req.params;
    const currentUserId = (req as any).user.id;

    // Check if task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
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
        },
        creator: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Check if user is a member of the board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        userId: parseInt(userId),
        boardId: task.column.board.id
      }
    });

    if (!boardMember) {
      return res.status(400).json({ error: 'User is not a member of this board' });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.taskMember.findFirst({
      where: {
        taskId: parseInt(taskId),
        userId: parseInt(userId)
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'User is already assigned to this task' });
    }

    // Create assignment with pending status
    const assignment = await prisma.taskMember.create({
      data: {
        taskId: parseInt(taskId),
        userId: parseInt(userId),
        status: 'PENDING' // Add status field
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Create notification for the assigned user
    await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type: 'TASK_ASSIGNMENT',
        title: 'New Task Assignment',
        message: `You have been assigned to task "${task.title}" by ${task.creator?.username || 'Unknown'}`,
        data: {
          taskId: parseInt(taskId),
          taskTitle: task.title,
          assignedBy: currentUserId,
          assignmentId: assignment.id
        }
      }
    });

    res.json(assignment);
  } catch (error) {
    console.error('Error assigning user to task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unassign user from task
export const unassignUserFromTask = async (req: Request, res: Response) => {
  try {
    const { taskId, userId } = req.params;
    const currentUserId = (req as any).user.id;

    // Check if task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        column: {
          board: {
            OR: [
              { ownerId: currentUserId },
              { members: { some: { userId: currentUserId } } }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Delete assignment
    await prisma.taskMember.deleteMany({
      where: {
        taskId: parseInt(taskId),
        userId: parseInt(userId)
      }
    });

    res.json({ message: 'User unassigned from task successfully' });
  } catch (error) {
    console.error('Error unassigning user from task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task assignments
export const getTaskAssignments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const currentUserId = (req as any).user.id;

    // Check if task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        column: {
          board: {
            OR: [
              { ownerId: currentUserId },
              { members: { some: { userId: currentUserId } } }
            ]
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Get all assignments for this task
    const assignments = await prisma.taskMember.findMany({
      where: {
        taskId: parseInt(taskId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error getting task assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available users for assignment (board members)
export const getAvailableUsers = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const currentUserId = (req as any).user.id;

    // Get task and its board
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
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

    // Get all board members
    const boardMembers = await prisma.boardMember.findMany({
      where: {
        boardId: task.column.board.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Get already assigned users (only ACCEPTED status)
    const assignedUserIds = await prisma.taskMember.findMany({
      where: {
        taskId: parseInt(taskId),
        status: 'ACCEPTED'
      },
      select: {
        userId: true
      }
    });

    const assignedIds = assignedUserIds.map((a: any) => a.userId);

    // Filter out already assigned users
    const availableUsers = boardMembers
      .map((bm: any) => bm.user)
      .filter((user: any) => !assignedIds.includes(user.id));

    res.json(availableUsers);
  } catch (error) {
    console.error('Error getting available users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Accept task assignment
export const acceptTaskAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const currentUserId = (req as any).user.id;

    // Find the assignment
    const assignment = await prisma.taskMember.findFirst({
      where: {
        id: parseInt(assignmentId),
        userId: currentUserId,
        status: 'PENDING'
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or already processed' });
    }

    // Update assignment status to ACCEPTED
    const updatedAssignment = await prisma.taskMember.update({
      where: {
        id: parseInt(assignmentId)
      },
      data: {
        status: 'ACCEPTED'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Delete the original task assignment notification for the user
    await prisma.notification.deleteMany({
      where: {
        userId: currentUserId,
        type: 'TASK_ASSIGNMENT',
        data: {
          path: ['assignmentId'],
          equals: assignment.id
        }
      }
    });

    // Create notification for task creator
    await prisma.notification.create({
      data: {
        userId: assignment.task.createdBy || assignment.task.column.board.ownerId,
        type: 'TASK_ASSIGNMENT_ACCEPTED',
        title: 'Task Assignment Accepted',
        message: `User has accepted the task assignment for "${assignment.task.title}"`,
        data: {
          taskId: assignment.task.id,
          taskTitle: assignment.task.title,
          acceptedBy: currentUserId,
          assignmentId: assignment.id
        }
      }
    });

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error accepting task assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject task assignment
export const rejectTaskAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const currentUserId = (req as any).user.id;

    // Find the assignment
    const assignment = await prisma.taskMember.findFirst({
      where: {
        id: parseInt(assignmentId),
        userId: currentUserId,
        status: 'PENDING'
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or already processed' });
    }

    // Delete the assignment
    await prisma.taskMember.delete({
      where: {
        id: parseInt(assignmentId)
      }
    });

    // Delete the original task assignment notification for the user
    await prisma.notification.deleteMany({
      where: {
        userId: currentUserId,
        type: 'TASK_ASSIGNMENT',
        data: {
          path: ['assignmentId'],
          equals: assignment.id
        }
      }
    });

    // Create notification for task creator
    await prisma.notification.create({
      data: {
        userId: assignment.task.createdBy || assignment.task.column.board.ownerId,
        type: 'TASK_ASSIGNMENT_REJECTED',
        title: 'Task Assignment Rejected',
        message: `User has rejected the task assignment for "${assignment.task.title}"`,
        data: {
          taskId: assignment.task.id,
          taskTitle: assignment.task.title,
          rejectedBy: currentUserId,
          assignmentId: assignment.id
        }
      }
    });

    res.json({ message: 'Task assignment rejected successfully' });
  } catch (error) {
    console.error('Error rejecting task assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
