import express from "express"
const router  = express.Router()
import multer from "multer";

import authCreatorFunction from "../middleware/auth.middleware.js";
import { 
  ServiceValidator, 
  editServiceValidator, 
  serviceIdParamValidator, 
  imageIdParamValidator, 
  getAllServicesValidator, 
  queryServicesValidator 
} from './../middleware/service.validator.js';
import serviceController from "../controllers/service.controller.js";


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Get all services with pagination (public route)
router.get("/",  getAllServicesValidator, serviceController.getAllServices);

// Query/search services with filters (public route)
router.get("/search",  queryServicesValidator, serviceController.queryServices);

// Get service by ID (public route)
router.get("/:serviceId", serviceIdParamValidator, serviceController.getServiceById);

// Create service
router.post("/createService", upload.array("images", 5), authCreatorFunction(['admin']), ServiceValidator, serviceController.createService);

// Toggle service active status (pause/activate)
router.patch("/:serviceId/toggle-status", authCreatorFunction(['admin']), serviceIdParamValidator, serviceController.toggleServiceStatus);

// Edit service details
router.put("/:serviceId", authCreatorFunction(['admin']), serviceIdParamValidator, editServiceValidator, serviceController.editService);

// Add images to service
router.post("/:serviceId/images", upload.array("images", 5), authCreatorFunction(['admin']), serviceIdParamValidator, serviceController.addImages);

// Delete image from service
router.delete("/:serviceId/images/:imageId", authCreatorFunction(['admin']), imageIdParamValidator, serviceController.deleteImage);

// Set primary image
router.patch("/:serviceId/images/:imageId/primary", authCreatorFunction(['admin']), imageIdParamValidator, serviceController.setPrimaryImage);



export default router;
