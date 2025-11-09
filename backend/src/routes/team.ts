import { Router, Request, Response } from 'express';
import { teamMembers } from '../data';

const router = Router();

// Get all team members
router.get('/', (req: Request, res: Response) => {
  res.json(teamMembers);
});

// Get single team member
router.get('/:id', (req: Request, res: Response) => {
  const member = teamMembers.find(m => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  res.json(member);
});

export default router;
