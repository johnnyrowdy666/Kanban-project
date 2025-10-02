# Kanban Board Project

A modern Kanban board application built with React, TypeScript, Node.js, and PostgreSQL.

## Tech Stack

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Dnd-kit** - Drag & Drop
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **CORS** - Cross-Origin Resource Sharing

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web Server (Frontend)
- **PostgreSQL** - Database (Containerized)

## Features

- **Task Management** - Create, edit, and organize tasks
- **Drag & Drop** - Intuitive task and column reordering
- **Team Collaboration** - Invite members and assign tasks
- **Tag System** - Organize tasks with custom tags
- **Notifications** - Real-time task assignment notifications


## Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Git (optional)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Kanban-project-main
```

### 2. Copy environment file
```bash
# Windows
copy env.example .env

# Mac/Linux
cp env.example .env
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

### 4. Run database migrations
```bash
# In a new terminal
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Development

### Start all services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs
```

## Project Structure

```
Kanban-project-main/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Server entry point
│   ├── prisma/             # Database schema & migrations
│   └── Dockerfile
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # State management
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml      # Docker services configuration
└── README.md
```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Environment (development/production)

### Ports
- **3000**: Frontend (Nginx)
- **3001**: Backend API
- **5432**: PostgreSQL Database

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   # Check if postgres is running
   docker-compose ps
   
   # Restart postgres
   docker-compose restart postgres
   ```

3. **Build failed**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

## Production Deployment

### 1. Update environment variables
```bash
# Edit .env file
# Change JWT_SECRET to a strong secret
# Update FRONTEND_URL to your domain
```

### 2. Deploy
```bash
docker-compose up -d
```

## Success!

Your Kanban Board should now be running at http://localhost:3000!


```

