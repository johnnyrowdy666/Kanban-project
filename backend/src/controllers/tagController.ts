import { Request, Response } from 'express';
import { prisma } from '../database';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color, boardId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: req.user!.userId },
          { members: { some: { userId: req.user!.userId } } }
        ]
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' });
    }

    // Check if tag already exists in this board
    const existingTag = await prisma.tag.findFirst({
      where: { 
        name,
        boardId 
      }
    });

    if (existingTag) {
      return res.status(409).json({ error: 'Tag with this name already exists in this board' });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3B82F6',
        boardId
      },
      include: {
        board: {
          select: {
            id: true,
            name: true
          }
        },
        taskTags: {
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
        }
      }
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;

    const whereClause = {
      board: {
        OR: [
          { ownerId: req.user!.userId },
          { members: { some: { userId: req.user!.userId } } }
        ]
      },
      ...(search ? {
        name: {
          contains: search as string,
          mode: 'insensitive' as const
        }
      } : {})
    };

    const tags = await prisma.tag.findMany({
      where: whereClause,
      include: {
        board: {
          select: {
            id: true,
            name: true
          }
        },
        taskTags: {
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
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTagsByBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const boardIdNum = parseInt(boardId);

    if (isNaN(boardIdNum)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    // Check if user has access to the board
    const board = await prisma.board.findFirst({
      where: {
        id: boardIdNum,
        OR: [
          { ownerId: req.user!.userId },
          { members: { some: { userId: req.user!.userId } } }
        ]
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' });
    }

    const tags = await prisma.tag.findMany({
      where: { boardId: boardIdNum },
      include: {
        board: {
          select: {
            id: true,
            name: true
          }
        },
        taskTags: {
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
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(tags);
  } catch (error) {
    console.error('Get tags by board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTagById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return res.status(400).json({ error: 'Invalid tag ID' });
    }

    const tag = await prisma.tag.findFirst({
      where: { 
        id: tagId,
        board: {
          OR: [
            { ownerId: req.user!.userId },
            { members: { some: { userId: req.user!.userId } } }
          ]
        }
      },
      include: {
        board: {
          select: {
            id: true,
            name: true
          }
        },
        taskTags: {
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
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return res.status(400).json({ error: 'Invalid tag ID' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    // Check if tag exists and user has access to the board
    const existingTag = await prisma.tag.findFirst({
      where: { 
        id: tagId,
        board: {
          OR: [
            { ownerId: req.user!.userId },
            { members: { some: { userId: req.user!.userId } } }
          ]
        }
      }
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found or access denied' });
    }

    // Check if new name conflicts with existing tag in the same board
    if (name !== existingTag.name) {
      const nameConflict = await prisma.tag.findFirst({
        where: { 
          name,
          boardId: existingTag.boardId,
          id: { not: tagId }
        }
      });

      if (nameConflict) {
        return res.status(409).json({ error: 'Tag with this name already exists in this board' });
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        color: color || existingTag.color
      },
      include: {
        board: {
          select: {
            id: true,
            name: true
          }
        },
        taskTags: {
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
        }
      }
    });

    res.json(updatedTag);
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return res.status(400).json({ error: 'Invalid tag ID' });
    }

    // Check if tag exists and user has access to the board
    const tag = await prisma.tag.findFirst({
      where: { 
        id: tagId,
        board: {
          OR: [
            { ownerId: req.user!.userId },
            { members: { some: { userId: req.user!.userId } } }
          ]
        }
      },
      include: {
        board: {
          select: {
            id: true,
            name: true
          }
        },
        taskTags: {
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
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found or access denied' });
    }

    // Delete tag (this will also delete all taskTags due to cascade)
    await prisma.tag.delete({
      where: { id: tagId }
    });

    res.json(tag);
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
