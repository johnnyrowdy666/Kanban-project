import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { prisma } from './database';
import authRoutes from './routes/auth';
import boardRoutes from './routes/board';
import columnRoutes from './routes/column';
import taskRoutes from './routes/task';
import memberRoutes from './routes/member';
import taskMemberRoutes from './routes/taskMember';
import tagRoutes from './routes/tag';
import taskTagRoutes from './routes/taskTag';
import taskAssignmentRoutes from './routes/taskAssignment';
import notificationRoutes from './routes/notification';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Kanban Board API Server is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/task-members', taskMemberRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/task-tags', taskTagRoutes);
app.use('/api/task-assignments', taskAssignmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${config.frontendUrl}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
  await prisma.$disconnect();
});

export default app;
