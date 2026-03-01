import { body, param, validationResult } from "express-validator";

// Validation rules for creating a consultation
export const createConsultationValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Consultation name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Consultation name must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("date")
    .trim()
    .notEmpty()
    .withMessage("Consultation date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Please provide a valid date in YYYY-MM-DD format")
    .custom((value) => {
      const consultationDate = new Date(value);
      
      // Check if date is valid
      if (isNaN(consultationDate.getTime())) {
        throw new Error("Invalid date provided");
      }
      
      // Check if date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (consultationDate < today) {
        throw new Error("Consultation date cannot be in the past");
      }
      return true;
    }),

  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1, max: 240 })
    .withMessage("Duration must be between 1 and 240 minutes"),

  body("buffer")
    .optional()
    .isInt({ min: 0, max: 60 })
    .withMessage("Buffer must be between 0 and 60 minutes"),

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

  body("endHour")
    .notEmpty()
    .withMessage("End hour is required")
    .isInt({ min: 0, max: 23 })
    .withMessage("End hour must be between 0 and 23"),

  body("endMinute")
    .notEmpty()
    .withMessage("End minute is required")
    .isInt({ min: 0, max: 59 })
    .withMessage("End minute must be between 0 and 59")
    .custom((value, { req }) => {
      // Validate that end time is after start time
      const startMinutes = parseInt(req.body.startHour) * 60 + parseInt(req.body.startMinute);
      const endMinutes = parseInt(req.body.endHour) * 60 + parseInt(value);
      
      if (endMinutes <= startMinutes) {
        throw new Error("End time must be after start time");
      }
      
      return true;
    }),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "general_physician",
      "pediatrics",
      "gynecology",
      "dermatology",
      "orthopedics",
      "cardiology",
      "neurology",
      "psychiatry",
      "ent",
      "ophthalmology",
      "dentistry",
      "pulmonology",
      "endocrinology",
      "gastroenterology",
      "urology"
    ])
    .withMessage("Invalid category selected"),

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

// Validation rules for confirming consultation
export const confirmConsultationValidator = [
  body("consultationId")
    .trim()
    .notEmpty()
    .withMessage("Consultation ID is required")
    .isMongoId()
    .withMessage("Please provide a valid consultation ID"),

  body("freeSlots")
    .notEmpty()
    .withMessage("Free slots array is required")
    .isArray()
    .withMessage("Free slots must be an array")
    .custom((value) => {
      // Allow empty array (doctor wants to keep all slots)
      if (!Array.isArray(value)) {
        throw new Error("Free slots must be an array");
      }
      
      // If array is not empty, check if all elements are valid MongoDB ObjectIds
      if (value.length > 0) {
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        const allValid = value.every(id => mongoIdRegex.test(id));
        
        if (!allValid) {
          throw new Error("All free slot IDs must be valid MongoDB ObjectIds");
        }
      }
      
      return true;
    }),

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

// Validation rules for consultation ID parameter (used by GET routes)
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

// Validation rules for adding prescription
export const addPrescriptionValidator = [
  body("patientId")
    .trim()
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Please provide a valid patient ID"),

  body("appointmentId")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Please provide a valid appointment ID"),

  body("diagnosis")
    .trim()
    .notEmpty()
    .withMessage("Diagnosis is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Diagnosis must be between 5 and 500 characters"),

  body("medicines")
    .notEmpty()
    .withMessage("Medicines array is required")
    .isArray({ min: 1 })
    .withMessage("At least one medicine must be provided"),

  body("medicines.*.name")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Medicine name must be between 2 and 100 characters"),

  body("medicines.*.type")
    .notEmpty()
    .withMessage("Medicine type is required")
    .isIn(["tablet", "capsule", "syrup", "injection", "ointment", "other"])
    .withMessage("Medicine type must be one of: tablet, capsule, syrup, injection, ointment, other"),

  body("medicines.*.dosagePerDay")
    .notEmpty()
    .withMessage("Dosage per day is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Dosage per day must be between 1 and 10"),

  body("medicines.*.timing")
    .optional()
    .isIn(["before_food", "after_food", "anytime"])
    .withMessage("Timing must be one of: before_food, after_food, anytime"),

  body("medicines.*.durationInDays")
    .notEmpty()
    .withMessage("Duration in days is required")
    .isInt({ min: 1, max: 365 })
    .withMessage("Duration must be between 1 and 365 days"),

  body("medicines.*.instructions")
    .optional()
    .isString()
    .withMessage("Instructions must be a string")
    .isLength({ max: 200 })
    .withMessage("Instructions must not exceed 200 characters"),

  body("additionalNotes")
    .optional()
    .isString()
    .withMessage("Additional notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Additional notes must not exceed 500 characters"),

  body("followUpDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Follow up date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (value) {
        const followUpDate = new Date(value);
        
        if (isNaN(followUpDate.getTime())) {
          throw new Error("Invalid follow up date provided");
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (followUpDate < today) {
          throw new Error("Follow up date cannot be in the past");
        }
      }
      return true;
    }),

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

// Validation rules for patient ID parameter
export const patientIdParamValidator = [
  param("patientId")
    .trim()
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Please provide a valid patient ID"),

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

// Validation rules for updating consultation status
export const updateConsultationStatusValidator = [
  body("consultationId")
    .trim()
    .notEmpty()
    .withMessage("Consultation ID is required")
    .isMongoId()
    .withMessage("Please provide a valid consultation ID"),

  body("isActive")
    .notEmpty()
    .withMessage("isActive status is required")
    .isBoolean()
    .withMessage("isActive must be a boolean value (true or false)"),

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

// Validation rules for doctor ID parameter
export const doctorIdParamValidator = [
  param("doctorId")
    .trim()
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Please provide a valid doctor ID"),

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
