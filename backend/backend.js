import express from 'express';
import cors from 'cors';
import RescueTime from './rescueTime.js';
const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.json({
      name: 'Hello World!'
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})