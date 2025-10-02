// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  isOwner?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Board Types
export interface Board {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner: User;
  columns: Column[];
  members: BoardMember[];
}

export interface BoardMember {
  id: number;
  userId: number;
  boardId: number;
  user: User;
}

export interface Member {
  id: number;
  userId: number;
  boardId: number;
  user: User;
}

// Column Types
export interface Column {
  id: number;
  name: string;
  boardId: number;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

// Task Types
export interface Task {
  id: number;
  title: string;
  description?: string;
  position: number;
  columnId: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  column: {
    id: number;
    name: string;
    boardId: number;
  };
  creator?: User;
  members: TaskMember[];
  taskTags: TaskTag[];
}

export interface TaskMember {
  id: number;
  userId: number;
  taskId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  user: User;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  color: string;
  boardId: number;
  createdAt: string;
  updatedAt: string;
  taskTags: TaskTag[];
}

export interface TaskTag {
  id: number;
  taskId: number;
  tagId: number;
  task: Task;
  tag: Tag;
}

// Notification Types
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  userId: number;
  taskId?: number;
  createdAt: string;
  task?: {
    id: number;
    title: string;
    column: {
      name: string;
      board: {
        id: number;
        name: string;
      };
    };
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface CreateBoardForm {
  name: string;
}

export interface CreateColumnForm {
  name: string;
  boardId: number;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  columnId: number;
  position?: number;
}

export interface CreateTagForm {
  name: string;
  color?: string;
}

// Drag & Drop Types
export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current: {
        taskId: number;
        columnId: number;
      };
    };
  };
  over: {
    id: string;
    data: {
      current: {
        columnId: number;
        position?: number;
      };
    };
  } | null;
}
