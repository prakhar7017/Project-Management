import Project from '../models/Project';
import TeamMember from '../models/TeamMember';

/**
 * Calculate task priority based on due date
 * - Due today or overdue → High priority
 * - Due in 1-3 days → Medium priority
 * - Due in 4+ days → Low priority
 * - No due date → Keep existing priority or default to medium
 */
export const calculatePriorityFromDueDate = (dueDate?: Date | string, currentPriority?: string): 'low' | 'medium' | 'high' => {
  if (!dueDate) {
    return (currentPriority as 'low' | 'medium' | 'high') || 'medium';
  }

  // Ensure dueDate is a Date object
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
  
  // Check if date is valid
  if (isNaN(due.getTime())) {
    console.warn('Invalid due date provided:', dueDate);
    return (currentPriority as 'low' | 'medium' | 'high') || 'medium';
  }

  const now = new Date();
  
  // Set time to start of day for accurate day comparison
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  console.log(`📅 Priority calculation: Due date ${due.toISOString().split('T')[0]}, Days until due: ${diffDays}`);

  if (diffDays < 0) {
    // Overdue
    return 'high';
  } else if (diffDays === 0) {
    // Due today
    return 'high';
  } else if (diffDays <= 3) {
    // Due in 1-3 days
    return 'medium';
  } else {
    // Due in 4+ days
    return 'low';
  }
};

/**
 * Auto-update priority for a single task based on due date
 */
export const autoUpdateTaskPriority = (task: any): boolean => {
  if (!task.dueDate || task.completed) {
    return false; // No due date or already completed, skip
  }

  // Ensure dueDate is a Date object (might be string from DB)
  const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
  
  // Check if dueDate is valid
  if (isNaN(dueDate.getTime())) {
    return false; // Invalid date
  }

  const newPriority = calculatePriorityFromDueDate(dueDate, task.priority);
  
  if (task.priority !== newPriority) {
    task.priority = newPriority;
    return true; // Priority was updated
  }
  
  return false; // Priority unchanged
};

/**
 * Auto-update priorities for all tasks in a project
 */
export const autoUpdateProjectTaskPriorities = async (projectId: string): Promise<number> => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return 0;
    }

    let updatedCount = 0;
    let hasChanges = false;
    
    console.log(`\n🔄 Auto-updating priorities for project: ${project.name}`);
    console.log(`   Total tasks: ${project.tasks.length}`);
    
    project.tasks.forEach((task, index) => {
      if (!task.completed && task.dueDate) {
        const beforePriority = task.priority || 'medium';
        console.log(`   Task ${index + 1}: "${task.name}"`);
        console.log(`     Current priority: ${beforePriority}`);
        console.log(`     Due date: ${task.dueDate} (type: ${typeof task.dueDate})`);
        
        if (autoUpdateTaskPriority(task)) {
          updatedCount++;
          hasChanges = true;
          console.log(`     ✅ Updated: ${beforePriority} → ${task.priority}`);
        } else {
          console.log(`     ⏭️  No change needed (already ${beforePriority})`);
        }
      } else if (task.completed) {
        console.log(`   Task ${index + 1}: "${task.name}" - Skipped (completed)`);
      } else if (!task.dueDate) {
        console.log(`   Task ${index + 1}: "${task.name}" - Skipped (no due date)`);
      }
    });

    if (hasChanges) {
      await project.save();
      console.log(`✅ Saved project with ${updatedCount} priority update(s)`);
    }

    return updatedCount;
  } catch (error) {
    console.error('Error auto-updating task priorities:', error);
    return 0;
  }
};

/**
 * Auto-update priorities for all tasks across all projects
 */
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
    console.error('Error auto-updating all task priorities:', error);
    return 0;
  }
};

/**
 * Find the best team member to assign a task to
 * Considers: workload, skills, capacity
 */
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

    // Calculate current workload for each member
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

    // Filter out excluded member
    const availableMembers = excludeMember
      ? membersWithWorkload.filter(m => m.name !== excludeMember)
      : membersWithWorkload;

    if (availableMembers.length === 0) {
      return null;
    }

    // Extract keywords from task name and description
    const taskText = `${taskName} ${taskDescription || ''}`.toLowerCase();
    const taskKeywords = taskText.split(/\s+/).filter(word => word.length > 3);

    // Score each member
    const scoredMembers = availableMembers.map(member => {
      let score = 0;

      // Lower workload = higher score (inverse relationship)
      // Member with 0% workload gets 100 points, 100% workload gets 0 points
      score += (100 - Math.min(member.workloadPercentage, 100));

      // Skill matching bonus
      if (member.skills.length > 0 && taskKeywords.length > 0) {
        const matchingSkills = member.skills.filter(skill =>
          taskKeywords.some(keyword => skill.toLowerCase().includes(keyword) || keyword.includes(skill.toLowerCase()))
        );
        score += matchingSkills.length * 20; // 20 points per matching skill
      }

      // Capacity bonus (more capacity = slightly better)
      if (member.capacity > 0) {
        score += Math.min(member.capacity * 2, 20); // Up to 20 points for capacity
      }

      // Penalty for high workload
      if (member.workloadPercentage >= 100) {
        score -= 50; // Heavy penalty for overloaded members
      } else if (member.workloadPercentage >= 70) {
        score -= 20; // Moderate penalty for high load
      }

      return {
        ...member,
        score
      };
    });

    // Sort by score (highest first) and return best match
    scoredMembers.sort((a, b) => b.score - a.score);
    const bestMatch = scoredMembers[0];

    // Only return if score is positive (avoid assigning to overloaded members)
    if (bestMatch && bestMatch.score > 0) {
      return bestMatch.name;
    }

    // If all members are overloaded, return the least overloaded
    if (scoredMembers.length > 0) {
      return scoredMembers[0].name;
    }

    return null;
  } catch (error) {
    console.error('Error finding best assignee:', error);
    return null;
  }
};

/**
 * Auto-assign a task to the best team member
 */
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

    // Find best assignee (excluding current assignee if any)
    const bestAssignee = await findBestAssignee(
      task.name,
      '', // Task description not available in task object
      task.assignedTo
    );

    if (!bestAssignee) {
      return { success: false, assignedTo: null, message: 'No suitable team member found' };
    }

    // Assign the task
    task.assignedTo = bestAssignee;
    await project.save();

    return {
      success: true,
      assignedTo: bestAssignee,
      message: `Task assigned to ${bestAssignee}`
    };
  } catch (error) {
    console.error('Error auto-assigning task:', error);
    return { success: false, assignedTo: null, message: 'Failed to auto-assign task' };
  }
};

