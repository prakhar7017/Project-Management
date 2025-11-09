import { Router, Request, Response } from 'express';
import TeamMember from '../models/TeamMember';
import Project from '../models/Project';

const router = Router();

// Get all team members with current workload
router.get('/', async (req: Request, res: Response) => {
  try {
    const teamMembers = await TeamMember.find();
    const projects = await Project.find();
    
    // Debug: Log all team members
    console.log('\n🔍 Team Members in DB:');
    teamMembers.forEach(m => console.log(`   - "${m.name}"`));
    
    // Debug: Log all assigned tasks
    console.log('\n📋 All Tasks with Assignments:');
    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignedTo) {
          console.log(`   - "${task.name}" → "${task.assignedTo}" (completed: ${task.completed})`);
        }
      });
    });
    
    const membersWithWorkload = teamMembers.map(member => {
      let taskCount = 0;
      let completedCount = 0;
      projects.forEach(project => {
        const matchingTasks = project.tasks.filter(
          task => task.assignedTo === member.name
        );
        taskCount += matchingTasks.filter(t => !t.completed).length;
        completedCount += matchingTasks.filter(t => t.completed).length;
        
        // Debug logging
        if (matchingTasks.length > 0) {
          console.log(`✅ Found ${matchingTasks.length} task(s) for "${member.name}" (${taskCount} active, ${completedCount} completed)`);
          matchingTasks.forEach(task => {
            console.log(`   - Task: "${task.name}", AssignedTo: "${task.assignedTo}", Completed: ${task.completed}`);
          });
        }
      });
      
      return {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        taskCount,
        capacity: member.capacity,
        skills: member.skills
      };
    });
    
    res.json(membersWithWorkload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get single team member
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// Create team member
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, role, capacity, skills } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const member = new TeamMember({
      name,
      email,
      role,
      capacity: capacity || 5,
      skills: skills || []
    });

    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email, role, capacity, skills } = req.body;
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (name !== undefined) member.name = name;
    if (email !== undefined) member.email = email;
    if (role !== undefined) member.role = role;
    if (capacity !== undefined) member.capacity = capacity;
    if (skills !== undefined) member.skills = skills;

    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Delete team member
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
