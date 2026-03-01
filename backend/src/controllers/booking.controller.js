import {createPayment,verifyPayment} from '../services/razorpay.service.js';
import serviceModel from '../models/service.model.js';
import bookingModel from '../models/bookings.model.js';
import nurseAvailabilityModel from '../models/nurseAvailability.model.js';
import leaveModel from '../models/leave.model.js';
import nurseServiceRelationModel from '../models/nurseServiceRelation.model.js';
import timeSlotModel from '../models/timeSlot.model.js';
import userModel from '../models/user.model.js';


const createBooking = async(req,res)=>{

    try{

        const { serviceId, date, startHour,startMinute,address } = req.body;
        // Convert date string to Date object

        const bookingDate = new Date(date);
        const bookingStartTime = startHour * 60 + startMinute; // Convert to total minutes

        const userId = req.user.userId;

        //finding service details and price
        const service = await serviceModel.findById(serviceId);
        
        //validations
        if(!service){
            return res.status(404).json({message:"Service not found"})
        }

        if(!service.isActive){
            return res.status(400).json({message:"Service is not active"})
        }

        //endtime of booking in minutes
        const bookingEndTime = bookingStartTime + service.sessionDuration


        // Calculate total price (for now, we assume quantity is always 1)
        const totalPrice = service.price

        // Check all nurses assigned for this service
        const nursesInService =  await nurseServiceRelationModel.find({serviceId:serviceId, isActive:true})

        if(!nursesInService){
            return res.status(404).json({message:"No nurses available for this service at this time"})
        }
        
        
        
        //getting id's of nurses assigned to this service
        const nurseIds = nursesInService.map(rel=>rel.nurseId.toString())

        
        
        //here for every nurse assigned to this service, we will check their availability and leaves and also if there are no other booking on that time on the booking date and time. If we find any nurse available, we will assign the booking to that nurse and break the loop. If no nurse is available, we will return an error message.

        for(let nurseId of nurseIds){
            
            const availability = await nurseAvailabilityModel.findOne({nurseId})
            
          
            //checking if nurse is available on that date and time (not on weekly off and also that booking time is within the available time of nurse)

            if(availability && !availability.weeklyOffDays.includes(bookingDate.getDay()) && bookingStartTime >= availability.startMinutes && (bookingStartTime + service.sessionDuration) <= availability.endMinutes){ 
                
                //checking if nurse is not on leave on that date
        

                const leave = await leaveModel.findOne({
                        nurseId,
                        startDate: { $lte: bookingDate },
                        endDate: { $gte: bookingDate },
                        status:"approved"
                })
               
                //if nurse is not on leave, we will check if there is no other booking on that date and time for that nurse
                if(!leave){

                    const buffer = 25; // Buffer time in minutes to prevent back-to-back bookings
                   
                    const preBookedBookings = await timeSlotModel.findOne({
                    nurseId,
                    date: bookingDate,
                    isBooked: { $in: ["pending", "booked"] },
                    startMinutes: { $lt: bookingEndTime }, //existing Start time is before new booking end time
                    endMinutes: { $gt: bookingStartTime - buffer } //existing End time is after new booking start time minus buffer (make number line to visualize this)
                });

                if(preBookedBookings){
                    continue; // If there is a conflict, try the next nurse
                }
                else{
                    // If no conflict, create the booking

                    const newBooking = new bookingModel({
                        userId: req.user.userId,
                        nurseId,
                        serviceId,
                        date: bookingDate,
                        startMinutes: bookingStartTime,
                        endMinutes: bookingEndTime,
                        status: "PAYMENT_PENDING",
                        totalPrice,
                        address,
                        expiresAt: new Date(Date.now() + 10*60*1000) // Set TTL for 15 minutes

                    });

                    await newBooking.save();

                    // Mark the time slot as booked in the timeSlotModel

                    const newTimeSlot = new timeSlotModel({
                        nurseId,
                        date: bookingDate,
                        startMinutes: bookingStartTime,
                        endMinutes: bookingEndTime,
                        isBooked: "pending",
                        bookingId: newBooking._id,
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // Set TTL for 15 minutes
                    });

                    await newTimeSlot.save();

                    const paymentResult = await createPayment(totalPrice,userId, newBooking._id)

                return res.status(201).json({
                        message:"Booking created successfully",
                        bookingId: newBooking._id,
                        nurseId,
                        startMinutes: bookingStartTime,
                        endMinutes: bookingEndTime,
                        payment: paymentResult,
                        address: newBooking.address
                })
            }
        }
    }
}

    return res.status(400).json({
        message:"No nurses available for this service at this time"
    })
        

    }catch(error){

        console.log("Error while creating booking",error);
        return res.status(500).json({message:"Error creating booking", error})
        
    }

}

const verifyPaymentAndBooking = async(req,res)=>{

    try{
        const { razorpayOrderId, paymentId, signature, bookingId} = req.body;
      
        
      const verificationResult = await verifyPayment({ razorpayOrderId, paymentId, signature });

      console.log("Verification result: ", verificationResult);

      if(verificationResult.success){
        // Update booking status to CONFIRMED
        const booking = await bookingModel.findById(bookingId);

        if(!booking){
            return res.status(404).json({message:"Booking not found"})
        }

        booking.status = "CONFIRMED";
        booking.expiresAt = null; // Clear the TTL since payment is successful
        await booking.save();

        // Update time slot status to booked
        await timeSlotModel.findOneAndUpdate(
            { bookingId: bookingId },
            { isBooked: "booked", expiresAt: null } // Clear TTL for the time slot
        );

        const nurse = await userModel.findById(booking.nurseId);

        return res.status(200).json({
            message: "Payment verified and booking confirmed",
            booking,
            nurse: {
                name: nurse.name,
                image: nurse.image
             }
        })
        
      }
    }catch(error){

        console.log("Error while verifying payment and confirming booking",error);
        return res.status(500).json({message:"Error verifying payment", error})
    }



}

const getUserBookings = async(req, res) => {
    try {
        const userId = req.user.userId;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status; // 'confirmed', 'completed', or undefined for all

        // Build query
        const query = { userId };
        
        // Filter by status if provided (only show active bookings by default)
        if (status) {
            query.status = status;
        } else {
            // By default, show only CONFIRMED and COMPLETED bookings
            query.status = { $in: ['CONFIRMED', 'COMPLETED'] };
        }

        // Get total count for pagination metadata
        const totalBookings = await bookingModel.countDocuments(query);

        // Get paginated bookings for the user
        const bookings = await bookingModel.find(query)
            .populate({
                path: 'nurseId',
                select: 'name image' // Only select name and image, exclude sensitive data
            })
            .populate({
                path: 'serviceId',
                select: 'name description images category sessionDuration price averageRating'
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
            createdAt: booking.createdAt,
            nurse: {
                name: booking.nurseId?.name,
                image: booking.nurseId?.image
            },
            service: {
                name: booking.serviceId?.name,
                images: booking.serviceId?.images,
                category: booking.serviceId?.category,
                sessionDuration: booking.serviceId?.sessionDuration,
                price: booking.serviceId?.price,
                averageRating: booking.serviceId?.averageRating
            }
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
        console.log("Error while fetching user bookings", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error
        });
    }
}

const getConfirmedBookings = async(req, res) => {
    try {
        const userId = req.user.userId;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of confirmed bookings for pagination metadata
        const totalBookings = await bookingModel.countDocuments({ 
            userId, 
            status: "CONFIRMED" 
        });

        // Get paginated confirmed bookings for the user
        const bookings = await bookingModel.find({ 
            userId,
            status: "CONFIRMED"
        })
            .populate({
                path: 'nurseId',
                select: 'name image' // Only select name and image, exclude sensitive data
            })
            .populate({
                path: 'serviceId',
                select: 'name description images category sessionDuration price averageRating'
            })
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No confirmed bookings found",
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
            createdAt: booking.createdAt,
            nurse: {
                name: booking.nurseId?.name,
                image: booking.nurseId?.image
            },
            service: {
                name: booking.serviceId?.name,
                images: booking.serviceId?.images,
                category: booking.serviceId?.category,
                sessionDuration: booking.serviceId?.sessionDuration,
                price: booking.serviceId?.price,
                averageRating: booking.serviceId?.averageRating
            }
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalBookings / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Confirmed bookings fetched successfully",
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
        console.log("Error while fetching confirmed bookings", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching confirmed bookings",
            error
        });
    }
}

const getBookingById = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        // Find booking and ensure it belongs to the requesting user
        const booking = await bookingModel.findOne({ 
            _id: bookingId, 
            userId 
        })
            .populate({
                path: 'nurseId',
                select: 'name image email phone'
            })
            .populate({
                path: 'serviceId',
                select: 'name description images category sessionDuration price averageRating'
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Format the response
        const formattedBooking = {
            bookingId: booking._id,
            date: booking.date,
            startMinutes: booking.startMinutes,
            endMinutes: booking.endMinutes,
            status: booking.status,
            totalPrice: booking.totalPrice,
            address: booking.address,
            createdAt: booking.createdAt,
            nurse: booking.nurseId ? {
                id: booking.nurseId._id,
                name: booking.nurseId.name,
                image: booking.nurseId.image,
                email: booking.nurseId.email,
                phone: booking.nurseId.phone
            } : null,
            service: booking.serviceId ? {
                id: booking.serviceId._id,
                name: booking.serviceId.name,
                description: booking.serviceId.description,
                images: booking.serviceId.images,
                category: booking.serviceId.category,
                sessionDuration: booking.serviceId.sessionDuration,
                price: booking.serviceId.price,
                averageRating: booking.serviceId.averageRating
            } : null
        };

        return res.status(200).json({
            success: true,
            message: "Booking fetched successfully",
            booking: formattedBooking
        });

    } catch(error) {
        console.log("Error while fetching booking by ID", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching booking",
            error
        });
    }
}

export default {
    createBooking,
    verifyPaymentAndBooking,
    getUserBookings,
    getConfirmedBookings,
    getBookingById
}