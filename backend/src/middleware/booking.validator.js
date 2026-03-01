import { body, validationResult } from "express-validator";

// Validation rules for creating a booking
export const createBookingValidator = [
  body("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Please provide a valid service ID"),

  body("date")
    .trim()
    .notEmpty()
    .withMessage("Booking date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Please provide a valid date in YYYY-MM-DD format")
    .custom((value) => {
      const bookingDate = new Date(value);
      
      // Check if date is valid
      if (isNaN(bookingDate.getTime())) {
        throw new Error("Invalid date provided");
      }
      
      // Check if date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error("Booking date cannot be in the past");
      }
      return true;
    }),

  body("startHour")
    .notEmpty()
    .withMessage("Start hour is required")
    .isInt({ min: 0, max: 23 })
    .withMessage("Start hour must be between 0 and 23"),

  body("startMinute")
    .notEmpty()
    .withMessage("Start minute is required")
    .isInt({ min: 0, max: 59 })
    .withMessage("Start minute must be between 0 and 59"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

// Validation rules for verifying payment and confirming booking
export const verifyPaymentValidator = [
  body("razorpayOrderId")
    .trim()
    .notEmpty()
    .withMessage("Razorpay order ID is required")
    .isString()
    .withMessage("Razorpay order ID must be a string"),

  body("paymentId")
    .trim()
    .notEmpty()
    .withMessage("Payment ID is required")
    .isString()
    .withMessage("Payment ID must be a string"),

  body("signature")
    .trim()
    .notEmpty()
    .withMessage("Signature is required")
    .isString()
    .withMessage("Signature must be a string"),

  body("bookingId")
    .trim()
    .notEmpty()
    .withMessage("Booking ID is required")
    .isMongoId()
    .withMessage("Please provide a valid booking ID"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];
