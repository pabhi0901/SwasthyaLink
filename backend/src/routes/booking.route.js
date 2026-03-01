import express from 'express';
const router = express.Router();
import authCreatorFunction from '../middleware/auth.middleware.js';
import bookingController from '../controllers/booking.controller.js';
import { createBookingValidator, verifyPaymentValidator } from '../middleware/booking.validator.js';

router.post("/create",authCreatorFunction(["customer"]),createBookingValidator,bookingController.createBooking)
router.post("/verify-payment",authCreatorFunction(["customer"]),verifyPaymentValidator,bookingController.verifyPaymentAndBooking)
router.get("/user-bookings",authCreatorFunction(["customer"]),bookingController.getUserBookings)
router.get("/confirmed-bookings",authCreatorFunction(["customer"]),bookingController.getConfirmedBookings)
router.get("/:bookingId",authCreatorFunction(["customer"]),bookingController.getBookingById)

export default router