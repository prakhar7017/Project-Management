# Project Management Dashboard

A full-stack project management application built with React, Node.js, TypeScript, and Express.

## Features

### 1. Project Dashboard
- View all projects with status indicators (In Progress, Completed, Not Started)
- Visual progress bars showing completion percentage
- Add new projects
- Edit project details and progress
- Delete projects
- Click on a project to view its tasks

### 2. Task Management
- View all tasks within a project
- Add new tasks with optional team member assignment
- Toggle task completion status (with visual feedback)
- Automatic project progress calculation based on completed tasks
- Delete tasks
- Visual indicators: strikethrough for completed tasks, green checkmarks

### 3. Team Overview
- View all team members
- See task count and capacity for each member
- Color-coded workload indicators:
  - **Green**: Available (< 70% capacity)
  - **Orange**: High Load (70-99% capacity)
  - **Red**: Overloaded (≥ 100% capacity)
- Automatic workload calculation based on assigned incomplete tasks

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **TypeScript** - Type safety
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique ID generation

## Project Structure

```
VZNX/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── projects.ts    # Project and task endpoints
│   │   │   └── team.ts        # Team member endpoints
│   │   ├── data.ts            # In-memory data store
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── server.ts          # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   ├── ProjectDashboard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TeamOverview.jsx
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Usage

1. **Start both servers** (backend and frontend) in separate terminal windows
2. **Open your browser** to `http://localhost:5173`
3. **Navigate** between Projects and Team views using the top navigation
4. **Create projects** using the "New Project" button
5. **Click on a project** to view and manage its tasks
6. **Add tasks** and assign them to team members
7. **Toggle task completion** by clicking the checkbox
8. **View team workload** in the Team Overview page

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

## Key Features Implemented

✅ **Project CRUD Operations** - Create, read, update, and delete projects  
✅ **Task Management** - Add, toggle completion, and delete tasks  
✅ **Automatic Progress Calculation** - Project progress updates when tasks are completed  
✅ **Team Workload Tracking** - Real-time calculation of team member workloads  
✅ **Visual Indicators** - Color-coded status badges and progress bars  
✅ **Responsive Design** - Clean, modern UI that works on all screen sizes  
✅ **Type Safety** - TypeScript on the backend for better code quality  
✅ **RESTful API** - Well-structured API endpoints  

## Data Flow

1. **Task Completion** → Triggers project progress recalculation
2. **Project Progress** → Automatically updates status (Not Started → In Progress → Completed)
3. **Task Assignment** → Updates team member workload counts
4. **Task Deletion** → Recalculates both project progress and team workload

## Notes

- Data is stored in-memory and will reset when the backend server restarts
- For production use, integrate a database (MongoDB, PostgreSQL, etc.)
- The application includes sample data to demonstrate functionality
- All API calls include error handling with user-friendly messages

## Future Enhancements

- User authentication and authorization
- Database integration for persistent storage
- Real-time updates using WebSockets
- Task due dates and priorities
- Project templates
- Activity timeline and notifications
- Export reports (PDF, CSV)
- Drag-and-drop task reordering
- Advanced filtering and search

## License

MIT
# Project-Management
