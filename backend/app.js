import dotenv from "dotenv/config";
dotenv.config();
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";
import connectDB from "./db/db.js";
import loginRouter from "./api/login.js";
import usersRouter from "./api/user.js";
import apiRouter from "./api/endpoints.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
await connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '8mb' })); // Increased limit for image uploads

// Health check route
app.get('/', (req, res) => res.send("Server is live..."));

// Auth routes (unprotected)
app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET); // Using same SECRET as login.js
        req.user = { userId: verified.id }; // Match the ID field from login.js
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};

// Protected routes
app.use('/api', authenticateToken);
app.use('/api', apiRouter);// Error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});