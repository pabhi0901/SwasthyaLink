import express from "express"
const router = express.Router()

import authCreatorFunction from "../middleware/auth.middleware.js"
import nurseController from "../controllers/nurse.controller.js"
import { chatMessagesValidator } from "../middleware/nurse.validator.js"


router.get("/chat/:bookingId", authCreatorFunction(["nurse", "customer"]), chatMessagesValidator, nurseController.getChatMessages)


export default router
