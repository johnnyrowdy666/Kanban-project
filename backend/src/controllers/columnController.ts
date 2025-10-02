import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const createColumn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, boardId } = req.body;
    const userId = req.user!.userId;

    if (!name || !boardId) {
      return res.status(400).json({ error: 'Column name and board ID are required' });
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' });
    }

    // Get the highest position in the board
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' }
    });

    const position = lastColumn ? lastColumn.position + 1 : 1;

    const column = await prisma.column.create({
      data: {
        name,
        position,
        boardId,
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        },
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
      }
    });

    res.status(201).json({
      message: 'Column created successfully',
      column,
    });
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getColumnsByBoard = async (req: AuthenticatedRequest, res: Response) => {
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

    const columns = await prisma.column.findMany({
      where: { boardId: boardIdNum },
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
      orderBy: { position: 'asc' }
    });

    res.json({ columns });
  } catch (error) {
    console.error('Get columns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getColumnById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const columnId = parseInt(id);

    if (isNaN(columnId)) {
      return res.status(400).json({ error: 'Invalid column ID' });
    }

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
        board: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        },
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
      }
    });

    if (!column) {
      return res.status(404).json({ error: 'Column not found or access denied' });
    }

    res.json({ column });
  } catch (error) {
    console.error('Get column error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateColumn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user!.userId;
    const columnId = parseInt(id);

    if (isNaN(columnId)) {
      return res.status(400).json({ error: 'Invalid column ID' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Column name is required' });
    }

    // Check if user has access to the board
    const column = await prisma.column.findFirst({
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

    if (!column) {
      return res.status(404).json({ error: 'Column not found or access denied' });
    }

    const updatedColumn = await prisma.column.update({
      where: { id: columnId },
      data: { name },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        },
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
      }
    });

    res.json({
      message: 'Column updated successfully',
      column: updatedColumn,
    });
  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteColumn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const columnId = parseInt(id);

    if (isNaN(columnId)) {
      return res.status(400).json({ error: 'Invalid column ID' });
    }

    // Check if user has access to the board
    const column = await prisma.column.findFirst({
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

    if (!column) {
      return res.status(404).json({ error: 'Column not found or access denied' });
    }

    await prisma.column.delete({
      where: { id: columnId }
    });

    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reorderColumns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const { columnIds } = req.body;
    const userId = req.user!.userId;
    const boardIdNum = parseInt(boardId);

    if (isNaN(boardIdNum)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    if (!Array.isArray(columnIds)) {
      return res.status(400).json({ error: 'Column IDs must be an array' });
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

    // Update column positions
    const updatePromises = columnIds.map((columnId: number, index: number) => 
      prisma.column.update({
        where: { id: columnId },
        data: { position: index + 1 }
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Columns reordered successfully' });
  } catch (error) {
    console.error('Reorder columns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
