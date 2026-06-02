const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize MongoDB Connection
connectDB();

const app = express();
app.disable('x-powered-by'); // Security: Disable X-Powered-By header to prevent framework disclosure


/**
 * Global Middleware
 */
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173', // Restrict CORS to frontend URL
//   credentials: true
// }));  // Enable Cross-Origin Resource Sharing with security config
app.use(
  cors({
    origin: [
      "https://task-manager-6ici.onrender.com",
      "https://task-manager-yuz2.onrender.com"
    ],
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON request bodies

/**
 * API Route Definitions
 */
app.use('/api/auth', authRoutes); // Authentication & User Management
app.use('/api/tasks', taskRoutes); // Task CRUD Operations

/**
 * Server Health Check
 */
app.get('/', (req, res) => {
  res.json({ message: '🚀 Task Manager Backend is working!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT} `);
});
