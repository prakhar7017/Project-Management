import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
    
    await mongoose.connect(mongoUri);
  } catch (error) {
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
});

mongoose.connection.on('error', (error) => {
});
