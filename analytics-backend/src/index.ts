import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { helloRouter } from './routes/hello.js';

const port = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors());

app.use('/api/hello', helloRouter);

app.listen(port, () => {
  console.log(`analytics-backend listening on http://localhost:${port}`);
});
