import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import projectRoutes from './routes/projectsNew';
import teamRoutes from './routes/teamNew';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
