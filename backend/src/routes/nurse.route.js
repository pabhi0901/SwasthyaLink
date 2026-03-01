import express from "express"
const router = express.Router()

import authCreatorFunction from "../middleware/auth.middleware.js"
import nurseController from "../controllers/nurse.controller.js"
import { 
  nurseIdParamValidator, 
  applyForLeaveValidator, 
  paginationQueryValidator,
  bookingIdParamValidator 
} from "../middleware/nurse.validator.js"


router.post("/applyLeave/:nurseId", authCreatorFunction(["nurse"]), nurseIdParamValidator, applyForLeaveValidator, nurseController.applyForLeave) 
router.get("/bookings", authCreatorFunction(["nurse"]), paginationQueryValidator, nurseController.getAllNurseBookings)
router.get("/pending-bookings", authCreatorFunction(["nurse"]), paginationQueryValidator, nurseController.getPendingNurseBookings)
router.get("/completed-bookings", authCreatorFunction(["nurse"]), paginationQueryValidator, nurseController.getCompletedNurseBookings)
router.patch("/booking/:bookingId/complete", authCreatorFunction(["nurse"]), bookingIdParamValidator, nurseController.markBookingCompleted)
router.get("/booking/:bookingId", authCreatorFunction(["nurse"]), bookingIdParamValidator, nurseController.getBookingById)
router.get("/leaves", authCreatorFunction(["nurse"]), paginationQueryValidator, nurseController.getAllNurseLeaves)


export default router