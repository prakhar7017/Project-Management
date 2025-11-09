import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { projects, updateTeamMemberCounts } from '../data';
import { Project, Task } from '../types';

const router = Router();

// Get all projects
router.get('/', (req: Request, res: Response) => {
  res.json(projects);
});

// Get single project
router.get('/:id', (req: Request, res: Response) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Create new project
router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const newProject: Project = {
    id: uuidv4(),
    name,
    status: 'Not Started',
    progress: 0,
    tasks: []
  };

  projects.push(newProject);
  res.status(201).json(newProject);
});

// Update project
router.put('/:id', (req: Request, res: Response) => {
  const { name, status, progress } = req.body;
  const projectIndex = projects.findIndex(p => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (name !== undefined) projects[projectIndex].name = name;
  if (status !== undefined) projects[projectIndex].status = status;
  if (progress !== undefined) projects[projectIndex].progress = progress;

  res.json(projects[projectIndex]);
});

// Delete project
router.delete('/:id', (req: Request, res: Response) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  projects.splice(projectIndex, 1);
  updateTeamMemberCounts();
  res.status(204).send();
});

// Calculate and update project progress based on tasks
const calculateProjectProgress = (projectId: string): number => {
  const project = projects.find(p => p.id === projectId);
  if (!project || project.tasks.length === 0) return 0;

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const progress = Math.round((completedTasks / project.tasks.length) * 100);
  
  // Update status based on progress
  if (progress === 100) {
    project.status = 'Completed';
  } else if (progress > 0) {
    project.status = 'In Progress';
  } else {
    project.status = 'Not Started';
  }
  
  project.progress = progress;
  return progress;
};

// Get project tasks
router.get('/:id/tasks', (req: Request, res: Response) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project.tasks);
});

// Add task to project
router.post('/:id/tasks', (req: Request, res: Response) => {
  const { name, assignedTo } = req.body;
  const project = projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Task name is required' });
  }

  const newTask: Task = {
    id: uuidv4(),
    name,
    completed: false,
    projectId: req.params.id,
    assignedTo
  };

  project.tasks.push(newTask);
  calculateProjectProgress(req.params.id);
  updateTeamMemberCounts();
  
  res.status(201).json(newTask);
});

// Update task
router.put('/:projectId/tasks/:taskId', (req: Request, res: Response) => {
  const { name, completed, assignedTo } = req.body;
  const project = projects.find(p => p.id === req.params.projectId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const task = project.tasks.find(t => t.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (name !== undefined) task.name = name;
  if (completed !== undefined) task.completed = completed;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;

  calculateProjectProgress(req.params.projectId);
  updateTeamMemberCounts();
  
  res.json(task);
});

// Delete task
router.delete('/:projectId/tasks/:taskId', (req: Request, res: Response) => {
  const project = projects.find(p => p.id === req.params.projectId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const taskIndex = project.tasks.findIndex(t => t.id === req.params.taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  project.tasks.splice(taskIndex, 1);
  calculateProjectProgress(req.params.projectId);
  updateTeamMemberCounts();
  
  res.status(204).send();
});

export default router;
