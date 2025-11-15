import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Project from '../models/Project';
import TeamMember from '../models/TeamMember';
import * as aiService from '../services/aiService';
import * as automationService from '../services/automationService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = new Project({
      name,
      description,
      status: 'Not Started',
      progress: 0,
      tasks: []
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.post('/:id/generate-tasks', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const aiTasks = await aiService.generateTasksFromDescription(
      project.name,
      project.description || ''
    );

    const newTasks = aiTasks.map(task => ({
      id: uuidv4(),
      name: task.name,
      completed: false,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      aiGenerated: true
    }));

    project.tasks.push(...newTasks);
    await project.save();

    res.json({ tasks: newTasks, message: 'AI generated tasks successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

router.get('/:id/insights', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const teamMembers = await TeamMember.find();
    const completedTasks = project.tasks.filter(t => t.completed).length;

    const insights = await aiService.analyzeProjectHealth(
      project.name,
      project.tasks.length,
      completedTasks,
      teamMembers.length
    );

    project.aiInsights = insights.summary;
    await project.save();

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, status, progress, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (name !== undefined) project.name = name;
    if (status !== undefined) project.status = status;
    if (progress !== undefined) project.progress = progress;
    if (description !== undefined) project.description = description;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

const calculateProjectProgress = (project: any): number => {
  if (project.tasks.length === 0) return 0;
  
  const completedTasks = project.tasks.filter((t: any) => t.completed).length;
  const progress = Math.round((completedTasks / project.tasks.length) * 100);
  
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

router.post('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const { name, assignedTo, priority, dueDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Task name is required' });
    }

    const estimatedHours = await aiService.estimateTaskDuration(name, project.description);

    const taskDueDate = dueDate ? new Date(dueDate) : undefined;
    const autoPriority = taskDueDate 
      ? automationService.calculatePriorityFromDueDate(taskDueDate, priority)
      : (priority || 'medium');

    const newTask = {
      id: uuidv4(),
      name,
      completed: false,
      assignedTo,
      priority: autoPriority,
      estimatedHours,
      aiGenerated: false,
      dueDate: taskDueDate
    };

    project.tasks.push(newTask);
    calculateProjectProgress(project);
    await project.save();
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.post('/:projectId/tasks/:taskId/recommend-assignment', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = project.tasks.find(t => t.id === req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const teamMembers = await TeamMember.find();
    const teamWithWorkload = await Promise.all(
      teamMembers.map(async (member) => {
        const allProjects = await Project.find();
        let taskCount = 0;
        allProjects.forEach(p => {
          taskCount += p.tasks.filter(t => !t.completed && t.assignedTo === member.name).length;
        });
        return {
          name: member.name,
          taskCount,
          capacity: member.capacity,
          skills: member.skills
        };
      })
    );

    const recommendation = await aiService.recommendTaskAssignment(task.name, teamWithWorkload);
    
    res.json({ recommendedAssignee: recommendation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});

router.put('/:projectId/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { name, completed, assignedTo, priority, dueDate } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = project.tasks.find(t => t.id === req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (name !== undefined) task.name = name;
    if (completed !== undefined) task.completed = completed;
    
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        task.assignedTo = undefined;
      } else {
        task.assignedTo = assignedTo;
      }
    }
    
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (priority === undefined && task.dueDate) {
        task.priority = automationService.calculatePriorityFromDueDate(task.dueDate, task.priority);
      }
    }

    if (priority === undefined && task.dueDate && !task.completed) {
      automationService.autoUpdateTaskPriority(task);
    }

    calculateProjectProgress(project);
    await project.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:projectId/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const taskIndex = project.tasks.findIndex(t => t.id === req.params.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    project.tasks.splice(taskIndex, 1);
    calculateProjectProgress(project);
    await project.save();
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, projectId } = req.body;
    
    let context = '';
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        context = `Current project: ${project.name}, ${project.tasks.length} tasks, ${project.progress}% complete`;
      }
    }

    const response = await aiService.chatWithAI(message, context);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

router.post('/:projectId/tasks/:taskId/auto-assign', async (req: Request, res: Response) => {
  try {
    const result = await automationService.autoAssignTask(req.params.projectId, req.params.taskId);
    
    if (result.success) {
      res.json({
        success: true,
        assignedTo: result.assignedTo,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to auto-assign task' });
  }
});

router.post('/:projectId/auto-update-priorities', async (req: Request, res: Response) => {
  try {
    const updatedCount = await automationService.autoUpdateProjectTaskPriorities(req.params.projectId);
    res.json({
      success: true,
      updatedCount,
      message: `Updated priority for ${updatedCount} task(s)`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update priorities' });
  }
});

export default router;
