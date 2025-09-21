import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import firebaseAdmin from "firebase-admin";
import { createServer } from "http";
import { Server as SocketServer } from 'socket.io';
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Utilities & Routes imports
import connectDB from "./utils/connection.util.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import gamificationRoutes from "./routes/gamification.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import customRoutes from "./routes/custom.routes.js";
import projectRoutes from "./routes/project.routes.js";

// Initialize Express
const app = express();

// Environment Configuration  
dotenv.config();
const PORT = process.env.PORT || 4000;

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Initialization
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, "../service-account.json");
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath));
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.warn("Firebase service account not found, authentication features will be limited");
}

// Database Connection
await connectDB();

// CORS Configuration
const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3030"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept'],
  exposedHeaders: ['set-cookie'],
  allowEIO3: true,
  maxAge: 86400
};

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/roadmap", customRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Create HTTP Server
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: CORS_OPTIONS
});

// Socket.IO Event Handlers with Error Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  try {
    // Broadcast user count
    io.emit('message', {
      type: 'system',
      text: `${io.engine.clientsCount} users online`,
      timestamp: new Date()
    });

    socket.on('message', (message) => {
      try {
        io.emit('message', {
          text: message,
          userId: socket.id,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', 'Failed to process message');
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', () => {
      try {
        console.log('Client disconnected:', socket.id);
        io.emit('message', {
          type: 'system',
          text: `${io.engine.clientsCount} users online`,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Socket disconnect error:', error);
      }
    });
  } catch (error) {
    console.error('Socket connection error:', error);
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Starting graceful shutdown...');

  server.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

