import bookingModel from "../models/bookings.model.js"
import chatsModel from "../models/chats.model.js"

export default function registerNurseChat(io,socket) {

    const canUserChat = async (bookingId)=>{
        const booking = await bookingModel.findById(bookingId)
        if(!booking) return {success:false}
        if(booking.nurseId.toString() !== socket.user.userId && booking.userId.toString() !== socket.user.userId) return {success:false}
        if(booking.status !== "CONFIRMED") return {success:false}

        if(booking.nurseId.toString() === socket.user.userId) return {success:true,role:"nurse",receiverId:booking.userId.toString()}
        if(booking.userId.toString() === socket.user.userId) return {success:true,role:"user", receiverId:booking.nurseId.toString()}
    }

    socket.on("joinNurseChat",async({bookingId})=>{
    
        try{
            if(!bookingId) return socket.emit("nurseChatError","Booking ID is required to join the chat")
            const isVerifiedUser = await canUserChat(bookingId)
            if(!isVerifiedUser.success) return socket.emit("nurseChatError","You are not authorized to join this chat")
            socket.join(bookingId)
            socket.emit("nurseChatJoined",isVerifiedUser)
            console.log(`Socket ${socket.id} joined nurse chat for booking ${bookingId}`)
        }catch(error){
            console.log("Error joining nurse chat ", error)
            socket.emit("nurseChatError","An error occurred while joining the chat")
        }
    })

    socket.on("nurseChatMessage",async({data,bookingId})=>{
        
        try{
            
            if(!bookingId) return socket.emit("nurseChatError","Booking ID is required to send a message")
            
            const isVerifedUser = await canUserChat(bookingId)
            
            if(!isVerifedUser.success) {
                    return socket.emit("nurseChatError","You are not authorized to send messages in this chat")
            }

            const message = await chatsModel.create({
                bookingId,
                senderId: socket.user.userId,
                receiverId: isVerifedUser.receiverId,
                message: data
            })
            
            io.to(bookingId).emit("newNurseChatMessage",{
                sender: socket.user.userId,
                message: data,
                timestamp: new Date()
            })

            



        }catch(error){
            console.log("Error sending nurse chat message ", error)
            socket.emit("nurseChatError","An error occurred while sending the message")
        }
    })

    

}