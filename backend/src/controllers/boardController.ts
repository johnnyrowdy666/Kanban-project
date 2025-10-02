import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const createBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.userId;

    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board = await prisma.board.create({
      data: {
        name,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        columns: true,
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
        }
      }
    });

    res.status(201).json({
      message: 'Board created successfully',
      board,
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBoards = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        columns: {
          include: {
            tasks: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
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
            }
          },
          orderBy: { id: 'asc' }
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBoardById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const boardId = parseInt(id);

    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        columns: {
          include: {
            tasks: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
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
            }
          },
          orderBy: { id: 'asc' }
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
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user!.userId;
    const boardId = parseInt(id);

    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    // Check if user is owner
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { name },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        columns: true,
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
        }
      }
    });

    res.json({
      message: 'Board updated successfully',
      board: updatedBoard,
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const boardId = parseInt(id);

    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    // Check if user is owner
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' });
    }

    await prisma.board.delete({
      where: { id: boardId }
    });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
