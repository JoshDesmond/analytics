import { Router } from 'express';
import { RescueTime } from '../rescueTime.js';

const rt = new RescueTime();
export const helloRouter = Router();

helloRouter.get('/', async (_req, res) => {
  try {
    const data = await rt.getScores();
    const score = rt.calculateProductivityPulse(data);
    console.log(`Productivity pulse: ${score}`);
    res.json(score);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: `failed to load data: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});
