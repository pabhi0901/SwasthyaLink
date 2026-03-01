import { body, param, query, validationResult } from "express-validator";

export const ServiceValidator = [

  body("name")
    .trim()
    .notEmpty().withMessage("Service name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Service name must be between 3-100 characters"),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn([
      "nursing",
      "elder-care",
      "post-surgery-care",
      "physiotherapy",
      "diagnostic",
      "home-visit-doctor",
      "vaccination",
      "palliative-care",
      "medical-equipment-rental",
      "icu-at-home",
      "mother-and-baby-care",
      "massage-therapy"
    ])
    .withMessage("Invalid service category"),

  body("sessionDuration")
    .optional()
    .isInt({ min: 15, max: 720 })
    .withMessage("Session duration must be between 15 and 720 minutes"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),

  body("images.*.url")
    .optional()
    .isURL()
    .withMessage("Each image must have a valid URL"),

  body("images.*.altText")
    .optional()
    .isString()
    .withMessage("Alt text must be a string"),

  body("images.*.isPrimary")
    .optional()
    .isBoolean()
    .withMessage("isPrimary must be boolean"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),

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

// Validator for editing service details
export const editServiceValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Service name must be between 3-100 characters"),

  body("description")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("category")
    .optional()
    .isIn([
      "nursing",
      "elder-care",
      "post-surgery-care",
      "physiotherapy",
      "diagnostic",
      "home-visit-doctor",
      "vaccination",
      "palliative-care",
      "medical-equipment-rental",
      "icu-at-home",
      "mother-and-baby-care",
      "massage-therapy"
    ])
    .withMessage("Invalid service category"),

  body("sessionDuration")
    .optional()
    .isInt({ min: 15, max: 720 })
    .withMessage("Session duration must be between 15 and 720 minutes"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

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

// Validator for serviceId parameter
export const serviceIdParamValidator = [
  param("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Please provide a valid service ID"),

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

// Validator for imageId parameter
export const imageIdParamValidator = [
  param("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Please provide a valid service ID"),

  param("imageId")
    .trim()
    .notEmpty()
    .withMessage("Image ID is required")
    .isMongoId()
    .withMessage("Please provide a valid image ID"),

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

// Validator for getAllServices query parameters
export const getAllServicesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("includeInactive")
    .optional()
    .isBoolean()
    .withMessage("includeInactive must be a boolean"),

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

// Validator for queryServices search parameters
export const queryServicesValidator = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number")
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error("Maximum price must be greater than minimum price");
      }
      return true;
    }),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("includeInactive")
    .optional()
    .isBoolean()
    .withMessage("includeInactive must be a boolean"),

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
