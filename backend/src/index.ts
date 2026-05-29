import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { habiticaReaderRouter } from './integrations/habitica/reader/router.js';
import { habiticaWriterRouter } from './integrations/habitica/writer/router.js';
import { linearReaderRouter } from './integrations/linear/reader/router.js';
import { rescueTimeReaderRouter } from './integrations/rescuetime/reader/router.js';

const port = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/linear', linearReaderRouter);
app.use('/api/rescuetime', rescueTimeReaderRouter);
app.use('/api/habitica', habiticaReaderRouter);
app.use('/api/habitica', habiticaWriterRouter);
// TODO: app.use('/api/google-sheets', googleSheetsReaderRouter);
// TODO: app.use('/api/google-sheets', googleSheetsWriterRouter);
// TODO: app.use('/api/daily', dailyRouter);

app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});
