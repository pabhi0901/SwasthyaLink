import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  process.env.frontendURL ? process.env.frontendURL.replace(/\/$/, '') : null,
  "https://swasthyalink-two.vercel.app",
  "https://swasthyalink-rcf09z67s-abhishek-pandeys-projects-2158b081.vercel.app"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

import chatRoutes from "./routes/chat.route.js";

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Agent service is running successfully");
});                             

// Public auth-free health & ping endpoint for keep-alive bots (Cron-job.org, UptimeRobot, etc.)
app.get(["/health", "/api/health", "/ping"], (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SwasthyaLink Agent Service",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/chat", chatRoutes);

export default app;