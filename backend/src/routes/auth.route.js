import express from "express"
const router = express.Router()
import authController from "../controllers/auth.controller.js"
import {registerUserValidator, loginUserValidator, registerNurseValidator, registerDoctorValidator, addAddressValidator, editAddressValidator, updateProfileValidator, changePasswordValidator} from "../middleware/auth.validator.js"
import authCreatorFunction from "../middleware/auth.middleware.js"

//middleware
import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// register/login/logout/getUser route
router.post("/register", upload.single('image'), registerUserValidator, authController.registerUser)
router.post("/login", loginUserValidator, authController.loginUser)
router.post("/logout", authCreatorFunction(['admin','nurse','customer','doctor']), authController.logout)
router.get("/me", authCreatorFunction(['admin','nurse','customer','doctor']), authController.getCurrentUser)

//create a nurse in the system - only admin can do that
router.post("/create-nurse", authCreatorFunction(['admin']), registerNurseValidator, authController.registerNurse)

//create a doctor in the system - only admin can do that
router.post("/create-doctor", authCreatorFunction(['admin']), registerDoctorValidator, authController.registerDoctor)

// User profile update routes
router.put("/profile", authCreatorFunction(['admin','nurse','customer','doctor']), upload.none(), updateProfileValidator, authController.updateProfile)
router.put("/profile/image", authCreatorFunction(['admin','nurse','customer','doctor']), upload.single('image'), authController.updateImage)
router.put("/profile/password", authCreatorFunction(['admin','nurse','customer','doctor']), upload.none(), changePasswordValidator, authController.changePassword)

// Address routes - All protected with authenticateUser middleware
router.post("/address", authCreatorFunction(['admin','nurse','customer','doctor']), upload.none(), addAddressValidator, authController.addAddress)
router.get("/addresses", authCreatorFunction(['admin','nurse','customer','doctor']), authController.getAllAddresses)
router.put("/address/:addressId", authCreatorFunction(['admin','nurse','customer','doctor']), editAddressValidator, authController.editAddress)
router.delete("/address/:addressId", authCreatorFunction(['admin','nurse','customer','doctor']), authController.deleteAddress)



export default router