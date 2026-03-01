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
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
  }
});

registerAllFunctions(io)

connectDB()

httpServer.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
});

