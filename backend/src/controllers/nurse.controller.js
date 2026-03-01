import leaveApplicationModel from "../models/leave.model.js"
import bookingModel from "../models/bookings.model.js"
import serviceModel from "../models/service.model.js"
import messageModel from "../models/chats.model.js"

const applyForLeave = async(req,res)=>{

    const {nurseId} =req.params
    let {startDate,endDate,reason} = req.body


    try{
        
        if(nurseId !== req.user.userId){
            return res.status(403).json({
                success:false,
                message:"You can only apply for leave for yourself"
            })
        }

        //create a new leave application
        startDate = new Date(startDate)
        endDate = new Date(endDate)

        const currentDate = new Date()

        if(startDate < currentDate){
            return res.status(400).json({
                success:false,
                message:"Start date cannot be in the past"
            })
        }

        if(startDate.getDate()-currentDate.getDate() < 2 && startDate.getMonth() === currentDate.getMonth() && startDate.getFullYear() === currentDate.getFullYear()){
            return res.status(400).json({
                success:false,
                message:"Leave applications must be submitted at least 2 days in advance"
            })
        }

        if(endDate < startDate){
            return res.status(400).json({
                success:false,
                message:"End date cannot be before start date"
            })
        }

        const newLeaveApplication = new leaveApplicationModel({
            nurseId,
            startDate,
            endDate,
            reason
        })

        await newLeaveApplication.save()


        res.status(201).json({
            success:true,
            message:"Leave application submitted successfully",
            data:newLeaveApplication
        })


    }catch(err){
        console.error("Error applying for leave:", err)
        res.status(500).json({
            success:false,
            message:"An error occurred while applying for leave"
        })
    }

}

const getAllNurseBookings = async(req, res) => {
    try {
        const nurseId = req.user.userId;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of bookings for pagination metadata
        const totalBookings = await bookingModel.countDocuments({ nurseId });

        // Get paginated bookings for the nurse
        const bookings = await bookingModel.find({ nurseId })
            .populate({
                path: 'serviceId',
                select: 'name description category sessionDuration'
            })
            .populate({
                path: 'userId',
                select: 'name phone'
            })
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No bookings found",
                bookings: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalBookings: 0,
                    bookingsPerPage: limit,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // Format the response
        const formattedBookings = bookings.map(booking => ({
            bookingId: booking._id,
            date: booking.date,
            startMinutes: booking.startMinutes,
            endMinutes: booking.endMinutes,
            status: booking.status,
            totalPrice: booking.totalPrice,
            address: {
                flatNumber: booking.address?.flatNumber,
                locality: booking.address?.locality,
                city: booking.address?.city,
                state: booking.address?.state,
                pincode: booking.address?.pincode
            },
            customer: {
                name: booking.userId?.name,
                phone: booking.userId?.phone
            },
            service: {
                name: booking.serviceId?.name,
                description: booking.serviceId?.description,
                category: booking.serviceId?.category,
                sessionDuration: booking.serviceId?.sessionDuration
            },
            createdAt: booking.createdAt
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalBookings / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            bookings: formattedBookings,
            pagination: {
                currentPage: page,
                totalPages,
                totalBookings,
                bookingsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch(error) {
        console.log("Error while fetching nurse bookings", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error
        });
    }
}

const getPendingNurseBookings = async(req, res) => {
    try {
        const nurseId = req.user.userId;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of pending bookings for pagination metadata
        const totalBookings = await bookingModel.countDocuments({ 
            nurseId,
            status: "CONFIRMED"
        });

        // Get paginated pending bookings for the nurse
        const bookings = await bookingModel.find({ 
            nurseId,
            status: "CONFIRMED"
        })
            .populate({
                path: 'serviceId',
                select: 'name description category sessionDuration images price'
            })
            .populate({
                path: 'userId',
                select: 'name phone'
            })
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No pending bookings found",
                bookings: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalBookings: 0,
                    bookingsPerPage: limit,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // Format the response
        const formattedBookings = bookings.map(booking => ({
            bookingId: booking._id,
            date: booking.date,
            startMinutes: booking.startMinutes,
            endMinutes: booking.endMinutes,
            status: booking.status,
            totalPrice: booking.totalPrice,
            address: {
                flatNumber: booking.address?.flatNumber,
                locality: booking.address?.locality,
                city: booking.address?.city,
                state: booking.address?.state,
                pincode: booking.address?.pincode
            },
            customer: {
                id: booking.userId?._id,
                name: booking.userId?.name,
                phone: booking.userId?.phone
            },
            service: {
                name: booking.serviceId?.name,
                description: booking.serviceId?.description,
                category: booking.serviceId?.category,
                sessionDuration: booking.serviceId?.sessionDuration,
                images: booking.serviceId?.images,
                price: booking.serviceId?.price
            },
            createdAt: booking.createdAt
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalBookings / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Pending bookings fetched successfully",
            bookings: formattedBookings,
            pagination: {
                currentPage: page,
                totalPages,
                totalBookings,
                bookingsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch(error) {
        console.log("Error while fetching pending nurse bookings", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching pending bookings",
            error
        });
    }
}


const getCompletedNurseBookings = async (req, res) => {
    try {
        const nurseId = req.user.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalBookings = await bookingModel.countDocuments({
            nurseId,
            status: "COMPLETED"
        });

        const bookings = await bookingModel.find({
            nurseId,
            status: "COMPLETED"
        })
            .populate({
                path: 'serviceId',
                select: 'name description category sessionDuration'
            })
            .populate({
                path: 'userId',
                select: 'name phone'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No completed bookings found",
                bookings: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalBookings: 0,
                    bookingsPerPage: limit,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        const formattedBookings = bookings.map(booking => ({
            bookingId: booking._id,
            date: booking.date,
            startMinutes: booking.startMinutes,
            endMinutes: booking.endMinutes,
            status: booking.status,
            totalPrice: booking.totalPrice,
            address: {
                flatNumber: booking.address?.flatNumber,
                locality: booking.address?.locality,
                city: booking.address?.city,
                state: booking.address?.state,
                pincode: booking.address?.pincode
            },
            customer: {
                name: booking.userId?.name,
                phone: booking.userId?.phone
            },
            service: {
                name: booking.serviceId?.name,
                description: booking.serviceId?.description,
                category: booking.serviceId?.category,
                sessionDuration: booking.serviceId?.sessionDuration
            },
            createdAt: booking.createdAt
        }));

        const totalPages = Math.ceil(totalBookings / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Completed bookings fetched successfully",
            bookings: formattedBookings,
            pagination: {
                currentPage: page,
                totalPages,
                totalBookings,
                bookingsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.log("Error while fetching completed nurse bookings", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching completed bookings",
            error
        });
    }
}


const markBookingCompleted = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const nurseId = req.user.userId;

        const booking = await bookingModel.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Ensure the booking belongs to this nurse
        if (booking.nurseId.toString() !== nurseId) {
            return res.status(403).json({
                success: false,
                message: "You can only mark your own bookings as completed"
            });
        }

        // Only confirmed bookings can be marked as completed
        if (booking.status !== "CONFIRMED") {
            return res.status(400).json({
                success: false,
                message: `Cannot mark a booking with status '${booking.status}' as completed. Only confirmed bookings can be completed.`
            });
        }

        booking.status = "COMPLETED";
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking marked as completed successfully",
            booking: {
                bookingId: booking._id,
                status: booking.status,
                date: booking.date,
                startMinutes: booking.startMinutes,
                endMinutes: booking.endMinutes,
                totalPrice: booking.totalPrice
            }
        });

    } catch (error) {
        console.log("Error while marking booking as completed", error);
        return res.status(500).json({
            success: false,
            message: "Error marking booking as completed",
            error
        });
    }
}


const getChatMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        // Verify booking exists and user is a participant
        const booking = await bookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.nurseId.toString() !== userId && booking.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this conversation"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;

        // Count total messages for this booking
        const totalMessages = await messageModel.countDocuments({ bookingId });

        // Fetch messages sorted newest first
        const messages = await messageModel.find({ bookingId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'senderId',
                select: 'name image'
            })
            .populate({
                path: 'receiverId',
                select: 'name image'
            });

        const totalPages = Math.ceil(totalMessages / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages,
            pagination: {
                currentPage: page,
                totalPages,
                totalMessages,
                messagesPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.log("Error while fetching chat messages", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error
        });
    }
}


const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const nurseId = req.user.userId;

        const booking = await bookingModel.findById(bookingId)
            .populate({
                path: 'serviceId',
                select: 'name description category sessionDuration images price'
            })
            .populate({
                path: 'userId',
                select: 'name phone'
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.nurseId.toString() !== nurseId) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own bookings"
            });
        }

        const formatted = {
            bookingId: booking._id,
            date: booking.date,
            startMinutes: booking.startMinutes,
            endMinutes: booking.endMinutes,
            status: booking.status,
            totalPrice: booking.totalPrice,
            address: {
                flatNumber: booking.address?.flatNumber,
                locality: booking.address?.locality,
                city: booking.address?.city,
                state: booking.address?.state,
                pincode: booking.address?.pincode
            },
            customer: {
                id: booking.userId?._id,
                name: booking.userId?.name,
                phone: booking.userId?.phone
            },
            service: {
                name: booking.serviceId?.name,
                description: booking.serviceId?.description,
                category: booking.serviceId?.category,
                sessionDuration: booking.serviceId?.sessionDuration,
                images: booking.serviceId?.images,
                price: booking.serviceId?.price
            },
            createdAt: booking.createdAt
        };

        return res.status(200).json({
            success: true,
            booking: formatted
        });

    } catch (error) {
        console.log("Error while fetching booking by ID", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching booking",
            error
        });
    }
}


const getAllNurseLeaves = async (req, res) => {
    try {
        const nurseId = req.user.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalLeaves = await leaveApplicationModel.countDocuments({ nurseId });

        const leaves = await leaveApplicationModel.find({ nurseId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalLeaves / limit);

        return res.status(200).json({
            success: true,
            message: "Leaves fetched successfully",
            leaves,
            pagination: {
                currentPage: page,
                totalPages,
                totalLeaves,
                leavesPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error fetching nurse leaves:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching leaves",
            error
        });
    }
}

export default {
    applyForLeave,
    getAllNurseBookings,
    getPendingNurseBookings,
    getCompletedNurseBookings,
    markBookingCompleted,
    getChatMessages,
    getBookingById,
    getAllNurseLeaves
}