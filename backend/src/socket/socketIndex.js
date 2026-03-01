import registerAuthMiddleware from "./middleware.socket.js"
import registerNurseChat from "./nurseChat.socket.js"

export default function registerAllFunctions(io) {

    // Register authentication middleware first
    registerAuthMiddleware(io)

    // Handle socket connections
    io.on("connection", (socket) => {
        console.log(`New socket connection: ${socket.id} - User: ${socket.user?.userId}`);

        // Register all socket event handlers
        registerNurseChat(io, socket)

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${socket.id} - Reason: ${reason}`);
        });

        // Handle errors
        socket.on("error", (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });

    })

}