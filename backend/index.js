// backend/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import mainApiRouter from './api/index.js';

const app = express();

connectDB();

const corsOptions = {
      origin: process.env.FRONTEND_URL
    };
    app.use(cors(corsOptions));
    
    app.use(express.json({ limit: '5mb' }));


app.use('/api', mainApiRouter); 


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});