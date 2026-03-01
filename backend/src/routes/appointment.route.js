import express from "express"
const router = express.Router()


import authCreatorFunction from "../middleware/auth.middleware.js"
import appointmentController from "../controllers/appointments.controller.js"
import { 
  consultationIdParamValidator, 
  bookAppointmentValidator, 
  confirmAppointmentValidator 
} from "../middleware/appointment.validator.js"

//get available slots for a consultation, public endpoint so users can see slots before logging in
router.get("/available-slots/:consultationId", consultationIdParamValidator, appointmentController.getAvailableSlots)

// Get customer's appointments
router.get("/my-appointments", authCreatorFunction(["customer"]), appointmentController.getMyAppointments)

// Get appointment details by ID
router.get("/:appointmentId", authCreatorFunction(["customer","doctor"]), appointmentController.getAppointmentDetails)

//create appointment, only customer can book the appointment
router.post("/create-appointment", authCreatorFunction(["customer"]), bookAppointmentValidator, appointmentController.bookAppointment)

//confirm appointment, after payment is done, only then appointment will be confirmed, 
router.post("/confirm-appointment", authCreatorFunction(["customer"]), confirmAppointmentValidator, appointmentController.confirmAppointment)

//get video call token for an appointment, only customer and doctor of that appointment can access
router.get("/video-call-token/:appointmentId", authCreatorFunction(["customer","doctor"]), appointmentController.getVideoCallToken)

// Get prescription by appointment ID
router.get("/prescription/:appointmentId", authCreatorFunction(["customer","doctor"]), appointmentController.getPrescription)

// Mark appointment as completed (doctor only)
router.patch("/mark-completed", authCreatorFunction(["doctor"]), appointmentController.markAppointmentAsCompleted)

export default router
