import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const inviteMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId, email } = req.body;
    const userId = req.user!.userId;

    if (!boardId || !email) {
      return res.status(400).json({ error: 'Board ID and email are required' });
    }

    // Check if user is the board owner
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' });
    }

    // Find user by email
    const userToInvite = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToInvite) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if user is already a member
    const existingMember = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: userToInvite.id
      }
    });

    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this board' });
    }

    // Check if user is trying to invite themselves
    if (userToInvite.id === userId) {
      return res.status(400).json({ error: 'You cannot invite yourself' });
    }

    // Add user to board
    const boardMember = await prisma.boardMember.create({
      data: {
        boardId,
        userId: userToInvite.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        board: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create notification for the invited user
    await prisma.notification.create({
      data: {
        type: 'BOARD_INVITATION',
        title: 'Board Invitation',
        message: `You have been invited to join the board "${board.name}"`,
        userId: userToInvite.id
      }
    });

    res.status(201).json(boardMember);
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBoardMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.userId;
    const boardIdNum = parseInt(boardId);

    if (isNaN(boardIdNum)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardIdNum,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' });
    }

    const members = await prisma.boardMember.findMany({
      where: { boardId: boardIdNum },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Get board owner info
    const owner = await prisma.user.findUnique({
      where: { id: board.ownerId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    // Add owner to members list with isOwner flag
    const allMembers = [
      ...members,
      {
        id: 0, // Special ID for owner
        userId: owner!.id,
        boardId: boardIdNum,
        user: {
          ...owner!,
          isOwner: true
        }
      }
    ];

    res.json(allMembers);
  } catch (error) {
    console.error('Get board members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { memberId } = req.params;
    const userId = req.user!.userId;
    const memberIdNum = parseInt(memberId);

    if (isNaN(memberIdNum)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }

    // Check if member exists and user has access to the board
    const member = await prisma.boardMember.findFirst({
      where: {
        id: memberIdNum,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found or access denied' });
    }

    // Check if user is the board owner
    if (member.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the board owner can remove members' });
    }

    // Remove member from board
    await prisma.boardMember.delete({
      where: { id: memberIdNum }
    });

    // Create notification for the removed member
    await prisma.notification.create({
      data: {
        type: 'BOARD_REMOVAL',
        title: 'Removed from Board',
        message: `You have been removed from the board "${member.board.name}"`,
        userId: member.userId
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const leaveBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.userId;
    const boardIdNum = parseInt(boardId);

    if (isNaN(boardIdNum)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    // Check if user is a member (not owner)
    const board = await prisma.board.findFirst({
      where: {
        id: boardIdNum,
        ownerId: userId
      }
    });

    if (board) {
      return res.status(400).json({ error: 'Board owner cannot leave the board. Transfer ownership first.' });
    }

    const member = await prisma.boardMember.findFirst({
      where: {
        boardId: boardIdNum,
        userId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'You are not a member of this board' });
    }

    // Remove member from board
    await prisma.boardMember.delete({
      where: { id: member.id }
    });

    res.json({ message: 'You have left the board successfully' });
  } catch (error) {
    console.error('Leave board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query } = req.query;
    const userId = req.user!.userId;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } }, // Exclude current user
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true
      },
      take: 10 // Limit results
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
