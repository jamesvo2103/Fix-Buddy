// backend/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import mainApiRouter from './api/index.js';
// You'll need middleware for auth, e.g., to get 'req.user'
// import { userExtractor } from './middleware/auth.js'; 

const app = express();

// --- Connect to Database ---
connectDB();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' })); // For image uploads

// --- Routes ---
// This one line imports all your routes
app.use('/api', mainApiRouter); 

// --- Error Handling (Example) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});