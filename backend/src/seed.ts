import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import Project from './models/Project';
import TeamMember from './models/TeamMember';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const seedData = async () => {
  try {
    await connectDatabase();
    
    // Clear existing data
    await Project.deleteMany({});
    await TeamMember.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // Seed team members
    const teamMembers = await TeamMember.create([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Frontend Developer',
        capacity: 5,
        skills: ['React', 'TypeScript', 'UI/UX']
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Full Stack Developer',
        capacity: 5,
        skills: ['Node.js', 'React', 'MongoDB']
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        role: 'Backend Developer',
        capacity: 5,
        skills: ['Node.js', 'Python', 'Databases']
      },
      {
        name: 'Diana Lee',
        email: 'diana@example.com',
        role: 'Marketing Specialist',
        capacity: 5,
        skills: ['Content Creation', 'Social Media', 'Analytics']
      }
    ]);
    
    console.log('✅ Created team members');
    
    // Seed projects
    const projects = await Project.create([
      {
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design and improved UX',
        status: 'In Progress',
        progress: 60,
        tasks: [
          { id: uuidv4(), name: 'Design mockups', completed: true, assignedTo: 'Alice Johnson', priority: 'high', estimatedHours: 16 },
          { id: uuidv4(), name: 'Implement homepage', completed: true, assignedTo: 'Bob Smith', priority: 'high', estimatedHours: 20 },
          { id: uuidv4(), name: 'Add contact form', completed: false, assignedTo: 'Alice Johnson', priority: 'medium', estimatedHours: 8 },
          { id: uuidv4(), name: 'Testing', completed: false, assignedTo: 'Charlie Davis', priority: 'high', estimatedHours: 12 },
          { id: uuidv4(), name: 'Deploy', completed: false, assignedTo: 'Bob Smith', priority: 'high', estimatedHours: 4 }
        ]
      },
      {
        name: 'Mobile App Development',
        description: 'Build a cross-platform mobile application for iOS and Android',
        status: 'In Progress',
        progress: 30,
        tasks: [
          { id: uuidv4(), name: 'Setup project structure', completed: true, assignedTo: 'Bob Smith', priority: 'high', estimatedHours: 8 },
          { id: uuidv4(), name: 'Build authentication', completed: false, assignedTo: 'Charlie Davis', priority: 'high', estimatedHours: 16 },
          { id: uuidv4(), name: 'Create dashboard', completed: false, assignedTo: 'Alice Johnson', priority: 'medium', estimatedHours: 20 },
          { id: uuidv4(), name: 'Integrate API', completed: false, assignedTo: 'Bob Smith', priority: 'high', estimatedHours: 12 },
          { id: uuidv4(), name: 'UI polish', completed: false, assignedTo: 'Alice Johnson', priority: 'low', estimatedHours: 10 }
        ]
      },
      {
        name: 'Marketing Campaign',
        description: 'Q4 marketing campaign across all digital channels',
        status: 'Completed',
        progress: 100,
        tasks: [
          { id: uuidv4(), name: 'Create content', completed: true, assignedTo: 'Diana Lee', priority: 'high', estimatedHours: 24 },
          { id: uuidv4(), name: 'Design graphics', completed: true, assignedTo: 'Alice Johnson', priority: 'medium', estimatedHours: 16 },
          { id: uuidv4(), name: 'Launch campaign', completed: true, assignedTo: 'Diana Lee', priority: 'high', estimatedHours: 8 }
        ]
      }
    ]);
    
    console.log('✅ Created projects');
    console.log(`\n📊 Seeded ${teamMembers.length} team members and ${projects.length} projects`);
    console.log('🎉 Database seeding completed!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
