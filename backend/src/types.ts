export interface Task {
  id: string;
  name: string;
  completed: boolean;
  projectId: string;
  assignedTo?: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'Not Started';
  progress: number;
  tasks: Task[];
}

export interface TeamMember {
  id: string;
  name: string;
  taskCount: number;
  capacity: number;
}
