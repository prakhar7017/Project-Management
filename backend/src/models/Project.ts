import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
  id: string;
  name: string;
  completed: boolean;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  aiGenerated?: boolean;
  dueDate?: Date;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  tasks: ITask[];
  aiInsights?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  assignedTo: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  estimatedHours: { type: Number },
  aiGenerated: { type: Boolean, default: false },
  dueDate: { type: Date }
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  tasks: [TaskSchema],
  aiInsights: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema);
