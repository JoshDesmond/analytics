import cors from 'cors';
import express from 'express';
import { googleSheetsPortRouter } from './warehouse/ports/google-sheets.js';
import { habiticaPortRouter } from './warehouse/ports/habitica.js';
import { linearPortRouter } from './warehouse/ports/linear.js';
import { rescueTimePortRouter } from './warehouse/ports/rescuetime.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/linear', linearPortRouter);
  app.use('/api/rescuetime', rescueTimePortRouter);
  app.use('/api/habitica', habiticaPortRouter);
  app.use('/api/google-sheets', googleSheetsPortRouter);

  return app;
}
