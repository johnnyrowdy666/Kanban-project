import axios from 'axios';
import type { 
  AuthResponse, 
  User, 
  Board, 
  Column, 
  Task, 
  Tag, 
  Notification, 
  NotificationStats,
  LoginForm,
  RegisterForm,
  CreateBoardForm,
  CreateColumnForm,
  CreateTaskForm,
  CreateTagForm,

  TaskMember,
  TaskTag,
  Member
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterForm): Promise<{ data: AuthResponse }> =>
    api.post('/auth/register', data),
  
  login: (data: LoginForm): Promise<{ data: AuthResponse }> =>
    api.post('/auth/login', data),
  
  getProfile: (): Promise<{ data: { user: User } }> =>
    api.get('/auth/profile'),
};

// Board API
export const boardAPI = {
  getBoards: (): Promise<{ data: { boards: Board[] } }> =>
    api.get('/boards'),
  
  getBoardById: (id: number): Promise<{ data: { board: Board } }> =>
    api.get(`/boards/${id}`),
  
  createBoard: (data: CreateBoardForm): Promise<{ data: { board: Board } }> =>
    api.post('/boards', data),
  
  updateBoard: (id: number, data: CreateBoardForm): Promise<{ data: { board: Board } }> =>
    api.put(`/boards/${id}`, data),
  
  deleteBoard: (id: number): Promise<{ data: { message: string } }> =>
    api.delete(`/boards/${id}`),
};

// Column API
export const columnAPI = {
  getColumnsByBoard: (boardId: number): Promise<{ data: { columns: Column[] } }> =>
    api.get(`/columns/board/${boardId}`),
  
  getColumnById: (id: number): Promise<{ data: { column: Column } }> =>
    api.get(`/columns/${id}`),
  
  createColumn: (data: CreateColumnForm): Promise<{ data: { column: Column } }> =>
    api.post('/columns', data),
  
  updateColumn: (id: number, data: { name: string }): Promise<{ data: { column: Column } }> =>
    api.put(`/columns/${id}`, data),
  
  deleteColumn: (id: number): Promise<{ data: { message: string } }> =>
    api.delete(`/columns/${id}`),
  
  reorderColumns: (boardId: number, columnIds: number[]): Promise<{ data: { message: string } }> =>
    api.put(`/columns/reorder/${boardId}`, { columnIds }),
};

// Task API
export const taskAPI = {
  getTasksByColumn: (columnId: number): Promise<{ data: { tasks: Task[] } }> =>
    api.get(`/tasks/column/${columnId}`),
  
  getTaskById: (id: number): Promise<{ data: { task: Task } }> =>
    api.get(`/tasks/${id}`),
  
  createTask: (data: CreateTaskForm): Promise<{ data: { task: Task } }> =>
    api.post('/tasks', data),
  
  updateTask: (id: number, data: Partial<CreateTaskForm>): Promise<{ data: { task: Task } }> =>
    api.put(`/tasks/${id}`, data),
  
  deleteTask: (id: number): Promise<{ data: { message: string } }> =>
    api.delete(`/tasks/${id}`),
  
  moveTask: (id: number, data: { columnId: number; position: number }): Promise<{ data: { task: Task } }> =>
    api.put(`/tasks/${id}/move`, data),
  
  reorderTasks: (columnId: number, taskIds: number[]): Promise<{ data: { message: string } }> =>
    api.put(`/tasks/reorder/${columnId}`, { taskIds }),
};

// Member API
export const memberAPI = {
  inviteMember: (boardId: number, email: string): Promise<{ data: Member }> =>
    api.post('/members/invite', { boardId, email }),
  
  getMembers: (boardId: number): Promise<{ data: Member[] }> =>
    api.get(`/members/board/${boardId}`),
  
  removeMember: (memberId: number): Promise<{ data: { message: string } }> =>
    api.delete(`/members/${memberId}`),
  
  leaveBoard: (boardId: number): Promise<{ data: { message: string } }> =>
    api.delete(`/members/board/${boardId}/leave`),
  
  searchUsers: (query: string): Promise<{ data: { users: User[] } }> =>
    api.get(`/members/search?query=${query}`),
};

// Task Member API
export const taskMemberAPI = {
  assignMember: (data: { taskId: number; userId: number }): Promise<{ data: { assignment: TaskMember } }> =>
    api.post('/task-members/assign', data),
  
  getTaskMembers: (taskId: number): Promise<{ data: { taskMembers: TaskMember[] } }> =>
    api.get(`/task-members/task/${taskId}`),
  
  removeMember: (taskId: number, memberId: number): Promise<{ data: { message: string } }> =>
    api.delete(`/task-members/task/${taskId}/member/${memberId}`),
};

// Tag API
export const tagAPI = {
  getTagsByBoard: (boardId: number): Promise<{ data: Tag[] }> =>
    api.get(`/tags/board/${boardId}`),
  
  getTagById: (id: number): Promise<{ data: Tag }> =>
    api.get(`/tags/${id}`),
  
  createTag: (data: CreateTagForm & { boardId: number }): Promise<{ data: Tag }> =>
    api.post('/tags', data),
  
  updateTag: (id: number, data: CreateTagForm): Promise<{ data: Tag }> =>
    api.put(`/tags/${id}`, data),
  
  deleteTag: (id: number): Promise<{ data: { message: string } }> =>
    api.delete(`/tags/${id}`),
};

// Task Tag API
export const taskTagAPI = {
  addTagToTask: (taskId: number, tagId: number): Promise<{ data: TaskTag }> =>
    api.post('/task-tags/add', { taskId, tagId }),
  
  removeTagFromTask: (taskId: number, tagId: number): Promise<{ data: { message: string } }> =>
    api.delete(`/task-tags/task/${taskId}/tag/${tagId}`),
  
  getTaskTags: (taskId: number): Promise<{ data: TaskTag[] }> =>
    api.get(`/task-tags/task/${taskId}`),
  
  getTasksByTag: (tagId: number): Promise<{ data: Task[] }> =>
    api.get(`/task-tags/tag/${tagId}/tasks`),
};

// Task Assignment API
export const taskAssignmentAPI = {
  assignUserToTask: (taskId: number, userId: number): Promise<{ data: TaskMember }> =>
    api.post(`/task-assignments/${taskId}/assign/${userId}`),
  
  unassignUserFromTask: (taskId: number, userId: number): Promise<{ data: { message: string } }> =>
    api.delete(`/task-assignments/${taskId}/unassign/${userId}`),
  
  getTaskAssignments: (taskId: number): Promise<{ data: TaskMember[] }> =>
    api.get(`/task-assignments/${taskId}/assignments`),
  
  getAvailableUsers: (taskId: number): Promise<{ data: User[] }> =>
    api.get(`/task-assignments/${taskId}/available-users`),
  
  acceptTaskAssignment: (assignmentId: number): Promise<{ data: TaskMember }> =>
    api.put(`/task-assignments/${assignmentId}/accept`),
  
  rejectTaskAssignment: (assignmentId: number): Promise<{ data: { message: string } }> =>
    api.put(`/task-assignments/${assignmentId}/reject`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<{ data: { notifications: Notification[]; pagination: any; unreadCount: number } }> =>
    api.get('/notifications', { params }),
  
  getNotificationById: (id: number): Promise<{ data: { notification: Notification } }> =>
    api.get(`/notifications/${id}`),
  
  markAsRead: (id: number): Promise<{ data: { notification: Notification } }> =>
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: (): Promise<{ data: { message: string } }> =>
    api.put('/notifications/read-all'),
  
  deleteNotification: (id: number): Promise<{ data: { message: string } }> =>
    api.delete(`/notifications/${id}`),
  
  deleteAllNotifications: (): Promise<{ data: { message: string } }> =>
    api.delete('/notifications'),
  
  getStats: (): Promise<{ data: NotificationStats }> =>
    api.get('/notifications/stats'),
};

export default api;
