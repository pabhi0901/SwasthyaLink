import express from "express"
const router = express.Router()
import authCreatorFunction from "../middleware/auth.middleware.js"
import adminController from "../controllers/admin.controller.js"
import { 
  assignServiceValidator, 
  assignTimeShiftValidator, 
  updateTimeShiftValidator,
  nurseIdParamValidator,
  serviceIdParamValidator,
  nurseServiceParamsValidator,
  publicIdParamValidator,
  updateLeaveStatusValidator
} from "../middleware/admin.validator.js"
import { paginationQueryValidator } from "../middleware/nurse.validator.js"

// Nurse access management
router.put("/toggle-nurse-access/:nurseId", 
  authCreatorFunction(["admin"]), 
  nurseIdParamValidator, 
  adminController.toggleNurseAccess
)

// Service assignment to nurses
router.post("/assign-service", 
  authCreatorFunction(["admin"]), 
  assignServiceValidator, 
  adminController.assignServiceToNurse
)

router.put("/toggle-service/:nurseId/:serviceId", 
  authCreatorFunction(["admin"]), 
  nurseServiceParamsValidator, 
  adminController.toggleNurseService
)

router.put("/disable-service/:nurseId/:serviceId", 
  authCreatorFunction(["admin"]), 
  nurseServiceParamsValidator, 
  adminController.disableServiceForNurse
)

router.put("/enable-service/:nurseId/:serviceId", 
  authCreatorFunction(["admin"]), 
  nurseServiceParamsValidator, 
  adminController.enableServiceForNurse
)

// Time shift management for nurses
router.post("/nurse-time-shift", 
  authCreatorFunction(['admin']), 
  assignTimeShiftValidator, 
  adminController.assignTimeShift
)

router.put("/nurse-time-shift/:nurseId", 
  authCreatorFunction(['admin']), 
  nurseIdParamValidator,
  updateTimeShiftValidator, 
  adminController.updateNurseTimeShift
)

// Get nurses
router.get("/nurses", 
  authCreatorFunction(["admin"]), 
  adminController.getAllNurses
)

router.get("/nurses/status-counts",
  authCreatorFunction(["admin"]),
  adminController.getNurseStatusCounts
)

router.get("/nurses/search-by-name", 
  authCreatorFunction(["admin"]), 
  adminController.searchNursesByName
)

router.get("/nurses/search/:publicId", 
  authCreatorFunction(["admin"]), 
  publicIdParamValidator, 
  adminController.searchNurseByPublicId
)

router.get("/nurses/:nurseId/services",
  authCreatorFunction(["admin"]),
  nurseIdParamValidator,
  adminController.getNurseAssignedServices
)

router.get("/nurses/service/:serviceId", 
  authCreatorFunction(["admin"]), 
  serviceIdParamValidator, 
  adminController.getNursesByService
)

router.get("/services/:serviceId/assignments",
  authCreatorFunction(["admin"]),
  serviceIdParamValidator,
  adminController.getServiceAssignmentsByService
)

router.get("/services/:serviceId/bookings",
  authCreatorFunction(["admin"]),
  serviceIdParamValidator,
  adminController.getConfirmedBookingsByService
)

// Get doctors
router.get("/doctors", 
  authCreatorFunction(["admin","customer"]), 
  paginationQueryValidator, 
  adminController.getAllDoctors
)

// Search doctors by name
router.get("/doctors/search",
  authCreatorFunction(["admin"]),
  adminController.searchDoctorsByName
)

// Toggle doctor access
router.patch("/doctors/:doctorId/toggle-access",
  authCreatorFunction(["admin"]),
  adminController.toggleDoctorAccess
)

// Leave management
router.get("/leaves/pending", 
  authCreatorFunction(["admin"]), 
  adminController.getPendingLeaves
)

router.get("/leaves/search-by-name", 
  authCreatorFunction(["admin"]), 
  adminController.searchLeavesByNurseName
)

router.get("/leaves/search-by-id/:publicId", 
  authCreatorFunction(["admin"]), 
  publicIdParamValidator, 
  adminController.searchLeavesByPublicId
)

router.get("/leaves/by-date", 
  authCreatorFunction(["admin"]), 
  adminController.getNursesOnLeaveByDate
)

router.get("/leaves/count-by-date",
  authCreatorFunction(["admin"]),
  adminController.getLeaveCountByDate
)

router.put("/leaves/:leaveId/status", 
  authCreatorFunction(["admin"]), 
  updateLeaveStatusValidator, 
  adminController.updateLeaveStatus
)


export default router