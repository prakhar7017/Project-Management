import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  email?: string;
  role?: string;
  capacity: number;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  role: { type: String },
  capacity: { type: Number, default: 5 },
  skills: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
