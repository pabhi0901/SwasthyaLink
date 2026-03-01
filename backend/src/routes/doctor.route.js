import express from "express";
const router = express.Router();

import authCreatorFunction from "../middleware/auth.middleware.js";
import doctorController from "../controllers/doctor.controller.js";
import { 
  createConsultationValidator, 
  confirmConsultationValidator, 
  consultationIdParamValidator,
  addPrescriptionValidator,
  patientIdParamValidator,
  updateConsultationStatusValidator,
  doctorIdParamValidator
} from "../middleware/doctor.validator.js";

import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//creating consultation, after this doctor will evaluate the slots and make them active for booking
router.post("/create-consultation", upload.single('image'), authCreatorFunction(['doctor']), createConsultationValidator, doctorController.createConsultation)
//confirmation of consultation slots will be done by doctor, only then they will be available for booking
router.patch("/confirm-consultation", authCreatorFunction(['doctor']), confirmConsultationValidator, doctorController.confirmConsultation)

// Get all confirmed appointments for a consultation
router.get("/consultation/:consultationId/confirmed-appointments", authCreatorFunction(['doctor']), consultationIdParamValidator, doctorController.getConfirmedAppointments)
// Get all completed appointments for a consultation
router.get("/consultation/:consultationId/completed-appointments", authCreatorFunction(['doctor']), consultationIdParamValidator, doctorController.getCompletedAppointments)
// Get total number of slots in a consultation
router.get("/consultation/:consultationId/total-slots", authCreatorFunction(['doctor']), consultationIdParamValidator, doctorController.getTotalSlotsInConsultancy)
// Get total number of confirmed appointments in a consultation
router.get("/consultation/:consultationId/confirmed-count", authCreatorFunction(['doctor']), consultationIdParamValidator, doctorController.getTotalConfirmedAppointments)

// Add prescription for a patient
router.post("/add-prescription", authCreatorFunction(['doctor']), addPrescriptionValidator, doctorController.addPrescription)

// Search consultations by name, description, or category (public - only active consultations)
router.get("/search-consultations",doctorController.searchConsultations)

// Get consultations by category (public - only active consultations)
router.get("/consultations-by-category", authCreatorFunction(['customer']),doctorController.getConsultationsByCategory)

// Get all previous prescriptions of a patient issued by same doctor
router.get("/patient/:patientId/prescriptions", authCreatorFunction(['doctor']), patientIdParamValidator, doctorController.getPatientPrescriptions)

// Update consultation isActive status
router.patch("/update-consultation-status", authCreatorFunction(['doctor']), updateConsultationStatusValidator, doctorController.updateConsultationStatus)

// Get all active consultations for a specific doctor
router.get("/doctor/:doctorId/active-consultations", authCreatorFunction(['admin', 'doctor','customer']), doctorIdParamValidator, doctorController.getActiveDoctorConsultations)

// Get active consultations for logged-in doctor
router.get("/my-active-consultations", authCreatorFunction(['doctor']), doctorController.getMyActiveConsultations)

// Get all consultations (active and inactive) for logged-in doctor  
router.get("/my-consultations", authCreatorFunction(['doctor']), doctorController.getAllMyConsultations)

export default router