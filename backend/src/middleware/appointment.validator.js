import { body, param, validationResult } from "express-validator";

// Validation rules for consultationId parameter
export const consultationIdParamValidator = [
  param("consultationId")
    .trim()
    .notEmpty()
    .withMessage("Consultation ID is required")
    .isMongoId()
    .withMessage("Please provide a valid consultation ID"),

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

// Validation rules for booking appointment
export const bookAppointmentValidator = [
  body("consultationId")
    .trim()
    .notEmpty()
    .withMessage("Consultation ID is required")
    .isMongoId()
    .withMessage("Please provide a valid consultation ID"),

  body("slotId")
    .trim()
    .notEmpty()
    .withMessage("Slot ID is required")
    .isMongoId()
    .withMessage("Please provide a valid slot ID"),

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

// Validation rules for confirming appointment after payment
export const confirmAppointmentValidator = [
  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Please provide a valid appointment ID"),

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
    .withMessage("Payment signature is required")
    .isString()
    .withMessage("Payment signature must be a string"),

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
