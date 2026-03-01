import cookie from "cookie"
import jwt from "jsonwebtoken"

export default async function registerAuthMiddleware(io) {
    io.use((socket, next) => {
        try {
            
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
            
            const token = cookies.token

            if (!token) {
                console.log("Socket connection rejected: No token provided");
                return next(new Error("Authentication error: No token provided"));
            }

            // verify JWT here
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            
            console.log(`Socket authenticated for user: ${decoded.userId} (${decoded.role})`);

            next();
            
        } catch (err) {
            console.log("Socket connection rejected: Invalid token", err.message);
            next(new Error("Authentication error: Invalid token"));
        }
    });
}