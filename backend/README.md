# Project Management Dashboard - Backend

Node.js + TypeScript + Express backend for the project management dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:id/tasks` - Get project tasks
- `POST /api/projects/:id/tasks` - Add task to project
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete task

### Team
- `GET /api/team` - Get all team members
- `GET /api/team/:id` - Get single team member

## Features

- Automatic project progress calculation based on completed tasks
- Automatic team member workload tracking
- In-memory data storage (resets on server restart)
