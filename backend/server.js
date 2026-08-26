import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./src/db/db.js"
import { createServer } from "http";
import { Server } from "socket.io";

import registerAllFunctions from "./src/socket/socketIndex.js"

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  process.env.frontendURL ? process.env.frontendURL.replace(/\/$/, '') : null,
  "https://swasthyalink-two.vercel.app",
  "https://swasthyalink-rcf09z67s-abhishek-pandeys-projects-2158b081.vercel.app"
].filter(Boolean);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
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
  }
});

registerAllFunctions(io)

connectDB()

const port = process.env.PORT || 5001

httpServer.listen(port,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
});

