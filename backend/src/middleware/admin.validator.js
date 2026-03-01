import { body, param, validationResult } from "express-validator";

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
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
};

// Param validators
export const nurseIdParamValidator = [
  param("nurseId")
    .trim()
    .notEmpty()
    .withMessage("Nurse ID is required")
    .isMongoId()
    .withMessage("Invalid Nurse ID format"),

  handleValidationErrors
];

export const serviceIdParamValidator = [
  param("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid Service ID format"),

  handleValidationErrors
];

export const nurseServiceParamsValidator = [
  param("nurseId")
    .trim()
    .notEmpty()
    .withMessage("Nurse ID is required")
    .isMongoId()
    .withMessage("Invalid Nurse ID format"),

  param("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid Service ID format"),

  handleValidationErrors
];

export const publicIdParamValidator = [
  param("publicId")
    .trim()
    .notEmpty()
    .withMessage("Public ID is required")
    .isNumeric()
    .withMessage("Public ID must be numeric")
    .isLength({ min: 12, max: 12 })
    .withMessage("Public ID must be exactly 12 digits"),

  handleValidationErrors
];

export const assignServiceValidator = [
  body("nurseId")
    .trim()
    .notEmpty()
    .withMessage("Nurse ID is required")
    .isMongoId()
    .withMessage("Invalid Nurse ID format"),

  body("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid Service ID format"),

  body("commissionPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Commission percentage must be a number between 0 and 100"),

  handleValidationErrors
];

export const assignTimeShiftValidator = [
  body("nurseId")
    .trim()
    .notEmpty()
    .withMessage("Nurse ID is required")
    .isMongoId()
    .withMessage("Invalid Nurse ID format"),

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
    .withMessage("End minute must be between 0 and 59"),

  body("weeklyOffDays")
    .optional()
    .isArray()
    .withMessage("Weekly off days must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
      }
      return true;
    })
    .withMessage("Weekly off days must be integers between 0 and 6 (0=Sunday, 6=Saturday)"),

  handleValidationErrors
];

export const updateTimeShiftValidator = [
  body("startHour")
    .optional()
    .isInt({ min: 0, max: 23 })
    .withMessage("Start hour must be between 0 and 23"),

  body("startMinute")
    .optional()
    .isInt({ min: 0, max: 59 })
    .withMessage("Start minute must be between 0 and 59"),

  body("endHour")
    .optional()
    .isInt({ min: 0, max: 23 })
    .withMessage("End hour must be between 0 and 23"),

  body("endMinute")
    .optional()
    .isInt({ min: 0, max: 59 })
    .withMessage("End minute must be between 0 and 59"),

  body("weeklyOffDays")
    .optional()
    .isArray()
    .withMessage("Weekly off days must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
      }
      return true;
    })
    .withMessage("Weekly off days must be integers between 0 and 6 (0=Sunday, 6=Saturday)"),

  handleValidationErrors
];

export const leaveIdParamValidator = [
  param("leaveId")
    .trim()
    .notEmpty()
    .withMessage("Leave ID is required")
    .isMongoId()
    .withMessage("Invalid Leave ID format"),

  handleValidationErrors
];

export const updateLeaveStatusValidator = [
  param("leaveId")
    .trim()
    .notEmpty()
    .withMessage("Leave ID is required")
    .isMongoId()
    .withMessage("Invalid Leave ID format"),

  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["APPROVED", "REJECTED"])
    .withMessage("Status must be either APPROVED or REJECTED"),

  handleValidationErrors
];
