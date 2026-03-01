import { body, param, query, validationResult } from "express-validator";

// Validation for booking ID parameter
export const bookingIdParamValidator = [
  param("bookingId")
    .trim()
    .notEmpty()
    .withMessage("Booking ID is required")
    .isMongoId()
    .withMessage("Please provide a valid booking ID"),

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

// Validation for chat messages query
export const chatMessagesValidator = [
  param("bookingId")
    .trim()
    .notEmpty()
    .withMessage("Booking ID is required")
    .isMongoId()
    .withMessage("Please provide a valid booking ID"),

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

// Validation rules for nurse ID parameter
export const nurseIdParamValidator = [
  param("nurseId")
    .trim()
    .notEmpty()
    .withMessage("Nurse ID is required")
    .isMongoId()
    .withMessage("Please provide a valid nurse ID"),

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

// Validation rules for applying for leave
export const applyForLeaveValidator = [
  body("startDate")
    .trim()
    .notEmpty()
    .withMessage("Start date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Please provide start date in YYYY-MM-DD format")
    .custom((value) => {
      const startDate = new Date(value);
      
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start date provided");
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error("Start date cannot be in the past");
      }
      
      return true;
    }),

  body("endDate")
    .trim()
    .notEmpty()
    .withMessage("End date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Please provide end date in YYYY-MM-DD format")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date provided");
      }
      
      if (req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        if (endDate < startDate) {
          throw new Error("End date cannot be before start date");
        }
      }
      
      return true;
    }),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason for leave is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason must be between 10 and 500 characters"),

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

// Validation rules for pagination query parameters
export const paginationQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

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
