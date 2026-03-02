import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./src/db/db.js"
import { createServer } from "http";
import { Server } from "socket.io";

import registerAllFunctions from "./src/socket/socketIndex.js"

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002',process.env.frontendURL,"https://swasthyalink-two.vercel.app","https://swasthyalink-rcf09z67s-abhishek-pandeys-projects-2158b081.vercel.app"],
    credentials: true
  }
});

registerAllFunctions(io)

connectDB()

const port = process.env.PORT || 5001

httpServer.listen(port,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
});

