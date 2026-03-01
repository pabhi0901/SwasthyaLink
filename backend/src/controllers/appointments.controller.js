import appointmentModel from "../models/appointments.model.js"
import consulationModel from "../models/consulation.model.js"
import userModel from "../models/user.model.js" 
import prescriptionModel from "../models/prescription.model.js"
import { createPayment ,verifyPayment} from "../services/razorpay.service.js"
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;

const getAvailableSlots = async (req,res)=>{
    
    const {consultationId} = req.params

    const consultation = await consulationModel.findById(consultationId)

    if(!consultation){
        return res.status(404).json({
            success: false,
            message: "No consultation found with this id"
        })
    }

    const slots = consultation.slots


    const availableSlots = []
    
    for(let i=0; i<slots.length; i++){

        const slot = slots[i]
        
        const appointment = await appointmentModel.findOne({
            consultationId,
            startMinute:slot.startMinute,
            endMinute:slot.endMinute,
        })
        
        if(!appointment){
            availableSlots.push({
                _id:slot._id,
                startMinute:slot.startMinute,
                endMinute:slot.endMinute
            })
        }

    }

    return res.status(200).json({
        success: true,
        message: "Slots fetched successfully",
        totalSlotsAvailable: availableSlots.length,
        availableSlots
    })

}

const bookAppointment = async (req,res)=>{

        const {consultationId,slotId} = req.body

        const consultation = await consulationModel.findById(consultationId)

        if(!consultation || !consultation.slots.id(slotId) || !consultation.isActive){
            return res.status(404).json({
                success: false,
                message: "Consultation is not available for booking"
            })
        }
        
        const slot = consultation.slots.id(slotId)

        const appointment = await appointmentModel.findOne({
            consultationId,
            startMinute:slot.startMinute,
            endMinute:slot.endMinute,
        })
        
        if(appointment){
            return res.status(400).json({
                success: false,
                message: "Slot already booked"
            })
        }

        // Check if this patient already has a confirmed/pending appointment overlapping this time on the same date
        const patientConflict = await appointmentModel.findOne({
            patientId: req.user.userId,
            date: consultation.date,
            status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
            startMinute: { $lt: slot.endMinute },
            endMinute: { $gt: slot.startMinute }
        })

        if (patientConflict) {
            return res.status(409).json({
                success: false,
                message: "You already have a booking at this time slot"
            })
        }

        const newAppointment = new appointmentModel({
            doctorId:consultation.doctorId,
            consultationId,
            patientId:req.user.userId,
            startMinute:slot.startMinute,
            endMinute:slot.endMinute,
            date:consultation.date,
            price:consultation.price,
            status:"PENDING_PAYMENT",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        })

        await newAppointment.save()

        // Create a payment entry for this appointment
        const payment = await createPayment(consultation.price, req.user.userId, newAppointment._id)
        
        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment: newAppointment,
            paymentDetails: {
                orderId: payment.id,
                amount: payment.amount,
                currency: payment.currency
            }
        })

}

const confirmAppointment = async (req,res)=>{

    try{


        const {appointmentId,razorpayOrderId, paymentId, signature} = req.body

        const appointment = await appointmentModel.findById(appointmentId)

        if(!appointment){
            return res.status(404).json({
                success: false,
                message: "No appointment found with this id"
            })
        }

        // Verify the payment signature
        const verificationResult = await verifyPayment({razorpayOrderId, paymentId, signature})

        if(!verificationResult.success){
            return res.status(400).json({
                success: false,
                message: verificationResult.message || "Invalid payment signature"
            })
        }

        // Update the appointment status to confirmed
        appointment.status = "CONFIRMED"
        appointment.expiresAt = null // Clear the expiration time since it's now confirmed
        await appointment.save()

        return res.status(200).json({
            success: true,
            message: "Appointment confirmed successfully",
            appointment: appointment
        })


    }catch(err){
        
        console.log("Error confirming appointment: ", err)
        return res.status(500).json({
            success: false,
            message: "Error confirming appointment"
        })

    }
}
 
const getVideoCallToken = async(req,res)=>{

    const userId = req.user.userId

    const appointmentId = req.params.appointmentId

    const user = await userModel.findById(userId)

    if(!user){
        return res.status(404).json({
            "mess":"User not found"
        })
    }

    if(user.role!=="customer" && user.role!=="doctor"){
        return res.status(403).json({
            "mess":"Unauthorized person to access video call token"
        })
    }

    const appointment = await appointmentModel.findById(appointmentId)

    if(!appointment || appointment.status!=="CONFIRMED"){
        return res.status(404).json({
            "mess":"Appointment not found"
        })
    }

    if(appointment.patientId.toString()!==userId && appointment.doctorId.toString()!==userId){
        return res.status(403).json({
            "mess":"Unauthorized person to access video call token"
        })
    }

    const now = new Date();


  const isSameDate =
  appointment.date.getUTCFullYear() === now.getUTCFullYear() &&
  appointment.date.getUTCMonth() === now.getUTCMonth() &&
  appointment.date.getUTCDate() === now.getUTCDate();

    // Convert current time to IST
    const istDate = new Date(
        
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    
    );

        const hour = istDate.getHours();
        const minute = istDate.getMinutes();

        const currentTimeInMinutes = hour * 60 + minute;

    if(!isSameDate || currentTimeInMinutes < appointment.startMinute || currentTimeInMinutes > appointment.endMinute){
        return res.status(400).json({
            "mess":"Video call token can only be generated during the appointment time"
        })
    }



      const channelName = `appointment_${appointment._id}`;
      // Derive a deterministic UID from the user's ID so the same user always
      // gets the same UID and two users in the same channel never collide.
      // MongoDB ObjectId's last 8 hex chars → 32-bit uint (max 0xFFFFFFFF)
      const uid = parseInt(userId.slice(-8), 16);
      const role = RtcRole.PUBLISHER; // Set role as publisher for both doctor and patient

        const expirationTimeInSeconds = appointment.duration*60; // Token valid for the duration of the appointment
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;


        const token = RtcTokenBuilder.buildTokenWithUid(
                process.env.AGORA_APP_ID,
                process.env.AGORA_APP_CERTIFICATE,
                channelName,
                uid,
                role,
                privilegeExpireTime
        );


        return res.json({
            token,
            channelName,
            uid,
            appId: process.env.AGORA_APP_ID
    });

    }


const markAppointmentAsCompleted = async(req, res) => {
    try {
        const doctorId = req.user.userId
        const { appointmentId } = req.body

        // Find the appointment
        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            })
        }

        // Verify that the doctor owns this appointment
        if (appointment.doctorId.toString() !== doctorId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to complete this appointment"
            })
        }

        // Check if appointment is confirmed
        if (appointment.status !== "CONFIRMED") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed appointments can be marked as completed"
            })
        }

        // Update status to COMPLETED
        appointment.status = "COMPLETED"
        await appointment.save()

        return res.status(200).json({
            success: true,
            message: "Appointment marked as completed successfully",
            appointment
        })

    } catch (err) {
        console.error("Error marking appointment as completed:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// Get customer's appointments
const getMyAppointments = async (req, res) => {
    try {
        const { userId } = req.user
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit
        const status = req.query.status // 'CONFIRMED', 'COMPLETED', or undefined for all
        
        // Build query - by default show only CONFIRMED and COMPLETED appointments
        const query = {
            patientId: userId
        }
        
        // Filter by specific status if provided, otherwise show CONFIRMED and COMPLETED
        if (status && (status === 'CONFIRMED' || status === 'COMPLETED')) {
            query.status = status
        } else if (!status) {
            query.status = { $in: ['CONFIRMED', 'COMPLETED'] }
        }
        
        // Get total count
        const totalAppointments = await appointmentModel.countDocuments(query)
        const totalPages = Math.ceil(totalAppointments / limit)
        
        const appointments = await appointmentModel.find(query)
            .populate('doctorId', 'name image')
            .populate('consultationId', 'name description duration category')
            .sort({ date: -1, startMinute: -1 })
            .skip(skip)
            .limit(limit)

        return res.status(200).json({
            success: true,
            appointments,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalAppointments: totalAppointments,
                appointmentsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })
    } catch (err) {
        console.error("Error fetching appointments:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// Get appointment details by ID
const getAppointmentDetails = async (req, res) => {
    try {
        const { appointmentId } = req.params
        const { userId } = req.user

        const appointment = await appointmentModel.findById(appointmentId)
            .populate('doctorId', 'name image email')
            .populate('consultationId', 'name description duration category image price date')
            .populate('patientId', 'name email')

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            })
        }

        // Check if user is authorized to view this appointment
        if (appointment.patientId._id.toString() !== userId && appointment.doctorId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this appointment"
            })
        }

        return res.status(200).json({
            success: true,
            appointment
        })
    } catch (err) {
        console.error("Error fetching appointment details:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// Get prescription by appointment ID
const getPrescription = async (req, res) => {
    try {
        const { appointmentId } = req.params
        const { userId } = req.user

        // Find the appointment to verify ownership
        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            })
        }

        // Check if user is authorized
        if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this prescription"
            })
        }

        // Find prescription
        const prescription = await prescriptionModel.findOne({ appointmentId: appointmentId })
            .populate('doctorId', 'name email')
            .populate('patientId', 'name email')

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not yet available"
            })
        }

        return res.status(200).json({
            success: true,
            prescription
        })
    } catch (err) {
        console.error("Error fetching prescription:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export default {getAvailableSlots,bookAppointment,confirmAppointment,getVideoCallToken,markAppointmentAsCompleted,getMyAppointments,getAppointmentDetails,getPrescription}