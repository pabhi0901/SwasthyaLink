import express from "express"
const app  = express()
import cookieParser from "cookie-parser"
import cors from "cors"

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
}))
app.use(express.json())
app.use(cookieParser())


//routes
import authRoutes from "./routes/auth.route.js"
import serviceRoutes from "./routes/service.route.js"
import adminRoutes from "./routes/admin.route.js"
import nurseRoutes from "./routes/nurse.route.js"
import bookingRoutes from "./routes/booking.route.js"
import doctorRoutes from "./routes/doctor.route.js"
import appointmentRoutes from "./routes/appointment.route.js"
import messageRoutes from "./routes/message.route.js"


app.use("/api/auth", authRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/doctor", doctorRoutes)
app.use("/api/nurse", nurseRoutes)
app.use("/api/booking", bookingRoutes)
app.use("/api/appointment",appointmentRoutes)
app.use("/api/messages", messageRoutes)


export default app