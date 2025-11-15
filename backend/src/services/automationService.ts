import Project from '../models/Project';
import TeamMember from '../models/TeamMember';

export const calculatePriorityFromDueDate = (dueDate?: Date | string, currentPriority?: string): 'low' | 'medium' | 'high' => {
  if (!dueDate) {
    return (currentPriority as 'low' | 'medium' | 'high') || 'medium';
  }

  const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
  
  if (isNaN(due.getTime())) {
    return (currentPriority as 'low' | 'medium' | 'high') || 'medium';
  }

  const now = new Date();
  
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'high';
  } else if (diffDays === 0) {
    return 'high';
  } else if (diffDays <= 3) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const autoUpdateTaskPriority = (task: any): boolean => {
  if (!task.dueDate || task.completed) {
    return false;
  }

  const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
  
  if (isNaN(dueDate.getTime())) {
    return false;
  }

  const newPriority = calculatePriorityFromDueDate(dueDate, task.priority);
  
  if (task.priority !== newPriority) {
    task.priority = newPriority;
    return true;
  }
  
  return false;
};

export const autoUpdateProjectTaskPriorities = async (projectId: string): Promise<number> => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return 0;
    }

    let updatedCount = 0;
    let hasChanges = false;
    
    project.tasks.forEach((task) => {
      if (!task.completed && task.dueDate) {
        if (autoUpdateTaskPriority(task)) {
          updatedCount++;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      await project.save();
    }

    return updatedCount;
  } catch (error) {
    return 0;
  }
};

export const autoUpdateAllTaskPriorities = async (): Promise<number> => {
  try {
    const projects = await Project.find();
    let totalUpdated = 0;

    for (const project of projects) {
      const updated = await autoUpdateProjectTaskPriorities(project._id.toString());
      totalUpdated += updated;
    }

    return totalUpdated;
  } catch (error) {
    return 0;
  }
};

export const findBestAssignee = async (
  taskName: string,
  taskDescription?: string,
  excludeMember?: string
): Promise<string | null> => {
  try {
    const teamMembers = await TeamMember.find();
    const projects = await Project.find();

    if (teamMembers.length === 0) {
      return null;
    }

    const membersWithWorkload = teamMembers.map(member => {
      let taskCount = 0;
      projects.forEach(project => {
        taskCount += project.tasks.filter(
          t => t.assignedTo === member.name && !t.completed
        ).length;
      });

      return {
        id: member._id.toString(),
        name: member.name,
        taskCount,
        capacity: member.capacity || 5,
        skills: member.skills || [],
        workloadPercentage: member.capacity > 0 ? (taskCount / member.capacity) * 100 : 0
      };
    });

    const availableMembers = excludeMember
      ? membersWithWorkload.filter(m => m.name !== excludeMember)
      : membersWithWorkload;

    if (availableMembers.length === 0) {
      return null;
    }

    const taskText = `${taskName} ${taskDescription || ''}`.toLowerCase();
    const taskKeywords = taskText.split(/\s+/).filter(word => word.length > 3);

    const scoredMembers = availableMembers.map(member => {
      let score = 0;

      score += (100 - Math.min(member.workloadPercentage, 100));

      if (member.skills.length > 0 && taskKeywords.length > 0) {
        const matchingSkills = member.skills.filter(skill =>
          taskKeywords.some(keyword => skill.toLowerCase().includes(keyword) || keyword.includes(skill.toLowerCase()))
        );
        score += matchingSkills.length * 20;
      }

      if (member.capacity > 0) {
        score += Math.min(member.capacity * 2, 20);
      }

      if (member.workloadPercentage >= 100) {
        score -= 50;
      } else if (member.workloadPercentage >= 70) {
        score -= 20;
      }

      return {
        ...member,
        score
      };
    });

    scoredMembers.sort((a, b) => b.score - a.score);
    const bestMatch = scoredMembers[0];

    if (bestMatch && bestMatch.score > 0) {
      return bestMatch.name;
    }

    if (scoredMembers.length > 0) {
      return scoredMembers[0].name;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const autoAssignTask = async (
  projectId: string,
  taskId: string
): Promise<{ success: boolean; assignedTo: string | null; message: string }> => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return { success: false, assignedTo: null, message: 'Project not found' };
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      return { success: false, assignedTo: null, message: 'Task not found' };
    }

    if (task.completed) {
      return { success: false, assignedTo: null, message: 'Cannot assign completed tasks' };
    }

    const bestAssignee = await findBestAssignee(
      task.name,
      '',
      task.assignedTo
    );

    if (!bestAssignee) {
      return { success: false, assignedTo: null, message: 'No suitable team member found' };
    }

    task.assignedTo = bestAssignee;
    await project.save();

    return {
      success: true,
      assignedTo: bestAssignee,
      message: `Task assigned to ${bestAssignee}`
    };
  } catch (error) {
    return { success: false, assignedTo: null, message: 'Failed to auto-assign task' };
  }
};

