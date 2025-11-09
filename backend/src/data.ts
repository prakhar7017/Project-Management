import { Project, TeamMember } from './types';

export let projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    status: 'In Progress',
    progress: 60,
    tasks: [
      { id: 't1', name: 'Design mockups', completed: true, projectId: '1', assignedTo: 'Alice Johnson' },
      { id: 't2', name: 'Implement homepage', completed: true, projectId: '1', assignedTo: 'Bob Smith' },
      { id: 't3', name: 'Add contact form', completed: false, projectId: '1', assignedTo: 'Alice Johnson' },
      { id: 't4', name: 'Testing', completed: false, projectId: '1', assignedTo: 'Charlie Davis' },
      { id: 't5', name: 'Deploy', completed: false, projectId: '1', assignedTo: 'Bob Smith' }
    ]
  },
  {
    id: '2',
    name: 'Mobile App Development',
    status: 'In Progress',
    progress: 30,
    tasks: [
      { id: 't6', name: 'Setup project structure', completed: true, projectId: '2', assignedTo: 'Bob Smith' },
      { id: 't7', name: 'Build authentication', completed: false, projectId: '2', assignedTo: 'Charlie Davis' },
      { id: 't8', name: 'Create dashboard', completed: false, projectId: '2', assignedTo: 'Alice Johnson' },
      { id: 't9', name: 'Integrate API', completed: false, projectId: '2', assignedTo: 'Bob Smith' },
      { id: 't10', name: 'UI polish', completed: false, projectId: '2', assignedTo: 'Alice Johnson' }
    ]
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    status: 'Completed',
    progress: 100,
    tasks: [
      { id: 't11', name: 'Create content', completed: true, projectId: '3', assignedTo: 'Diana Lee' },
      { id: 't12', name: 'Design graphics', completed: true, projectId: '3', assignedTo: 'Alice Johnson' },
      { id: 't13', name: 'Launch campaign', completed: true, projectId: '3', assignedTo: 'Diana Lee' }
    ]
  }
];

export let teamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Alice Johnson', taskCount: 5, capacity: 5 },
  { id: 'tm2', name: 'Bob Smith', taskCount: 4, capacity: 5 },
  { id: 'tm3', name: 'Charlie Davis', taskCount: 2, capacity: 5 },
  { id: 'tm4', name: 'Diana Lee', taskCount: 2, capacity: 5 }
];

export const updateTeamMemberCounts = () => {
  // Reset all counts
  teamMembers.forEach(member => member.taskCount = 0);
  
  // Count incomplete tasks for each member
  projects.forEach(project => {
    project.tasks.forEach(task => {
      if (!task.completed && task.assignedTo) {
        const member = teamMembers.find(m => m.name === task.assignedTo);
        if (member) {
          member.taskCount++;
        }
      }
    });
  });
};
