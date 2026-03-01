import uploadFileToImageKit from "../services/imagekit.service.js"
import serviceModel from "../models/service.model.js";
import { nanoid } from "nanoid";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const createService = async(req,res)=>{

   try{


     const {name,description,category,sessionDuration,price} = req.body
    
    const imagesUrl = [];

        if (req.files && req.files.length > 0) {
            
        const responses = await Promise.all(
            req.files.map(file =>
            uploadFileToImageKit(file, "service_images")
        ));

        responses.forEach(url => imagesUrl.push({
            url:url,
            isPrimary:false,
        }));
    }


    const service = await serviceModel.create({
        name,
        description,
        category,
        sessionDuration,
        price,
        images:imagesUrl,
        createdBy:req.user.userId,
        averageRating:5,
        totalBookings:1  
    })


    return res.status(201).json({
        success: true,
        message: "Service created successfully",
        service: {
            id: service._id,
            name: service.name,
            description: service.description,
            category: service.category,
            sessionDuration: service.sessionDuration,
            price: service.price,
            images: service.images,
            averageRating: service.averageRating,
            isActive: service.isActive,
            createdAt: service.createdAt
        }
    })



   }
   catch(err){
    
    console.log("Error creating service")
    console.log(err);

    return res.status(501).json({
        mess:"Internal Server Error"
    })
    
   }


}

// Toggle service active status (pause/activate)
const toggleServiceStatus = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.userId;

        const service = await serviceModel.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Check if user is the creator or admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this service"
            });
        }

        service.isActive = !service.isActive;
        await service.save();

        return res.status(200).json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'paused'} successfully`,
            service: {
                id: service._id,
                name: service.name,
                isActive: service.isActive
            }
        });

    } catch (err) {
        console.log("Error toggling service status");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Edit service details
const editService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.userId;
        const { name, description, category, sessionDuration, price } = req.body;

        const service = await serviceModel.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Check if user is the creator or admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this service"
            });
        }

        // Update fields if provided
        if (name) service.name = name;
        if (description) service.description = description;
        if (category) service.category = category;
        if (sessionDuration) service.sessionDuration = sessionDuration;
        if (price) service.price = price;

        await service.save();

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service: {
                id: service._id,
                name: service.name,
                description: service.description,
                category: service.category,
                sessionDuration: service.sessionDuration,
                price: service.price,
                images: service.images,
                isActive: service.isActive,
                updatedAt: service.updatedAt
            }
        });

    } catch (err) {
        console.log("Error editing service");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Add images to service
const addImages = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.userId;

        const service = await serviceModel.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Check if user is the creator or admin
        if ( req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this service"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images provided"
            });
        }

        const newImages = [];
        const responses = await Promise.all(
            req.files.map(file => uploadFileToImageKit(file, "service_images"))
        );

        responses.forEach(url => newImages.push({
            url: url,
            isPrimary: false
        }));

        service.images.push(...newImages);
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Images added successfully",
            addedImages: newImages,
            totalImages: service.images.length
        });

    } catch (err) {
        console.log("Error adding images");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Delete image from service by image ID
const deleteImage = async (req, res) => {
    try {
        const { serviceId, imageId } = req.params;
        const userId = req.user.userId;

        const service = await serviceModel.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Check if user is the creator or admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this service"
            });
        }

        const imageIndex = service.images.findIndex(img => img._id.toString() === imageId);

        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        service.images.splice(imageIndex, 1);
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully",
            remainingImages: service.images.length
        });

    } catch (err) {
        console.log("Error deleting image");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Set or change primary image
const setPrimaryImage = async (req, res) => {
    try {
        const { serviceId, imageId } = req.params;
        const userId = req.user.userId;

        const service = await serviceModel.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Check if user is the creator or admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this service"
            });
        }

        const imageIndex = service.images.findIndex(img => img._id.toString() === imageId);

        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        // Set all images to non-primary
        service.images.forEach(img => img.isPrimary = false);
        
        // Set selected image as primary
        service.images[imageIndex].isPrimary = true;
        
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Primary image updated successfully",
            primaryImage: service.images[imageIndex]
        });

    } catch (err) {
        console.log("Error setting primary image");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get all services with pagination
const getAllServices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Only show active services by default
        const isActive = req.query.includeInactive === 'true' ? {} : { isActive: true };

        const services = await serviceModel
            .find(isActive)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email role');

        const totalServices = await serviceModel.countDocuments(isActive);
        const totalPages = Math.ceil(totalServices / limit);

        return res.status(200).json({
            success: true,
            message: "Services fetched successfully",
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalServices: totalServices,
                servicesPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            services: services
        });

    } catch (err) {
        console.log("Error getting all services");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Query/search services with filters and pagination
const queryServices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const includeInactive = req.query.includeInactive === 'true';
        const searchTerm = req.query.search ? req.query.search.trim() : '';

        // Build query object
        const query = includeInactive ? {} : { isActive: true };

        if (searchTerm) {
            const safeSearch = escapeRegex(searchTerm);
            const regex = new RegExp(safeSearch, 'i');
            query.$or = [
                { name: regex },
                { description: regex },
                { category: regex }
            ];
        }

        // Text search on name and description using MongoDB text index
        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Sort by relevance if search is used, otherwise by newest
        let sort = { createdAt: -1 };
        if (searchTerm) {
            sort = { updatedAt: -1 };
        }

        const services = await serviceModel.find(query)
            .skip(offset)
            .limit(limit)
            .sort(sort)
            .populate('createdBy', 'name email role');

        const totalServices = await serviceModel.countDocuments(query);
        const totalPages = Math.ceil(totalServices / limit);

        return res.status(200).json({
            success: true,
            message: "Services fetched successfully",
            filters: {
                search: req.query.search || null,
                minPrice: req.query.minPrice || null,
                maxPrice: req.query.maxPrice || null,
                includeInactive
            },
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalServices: totalServices,
                servicesPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            services: services
        });

    } catch (err) {
        console.log("Error querying services");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get service by ID
const getServiceById = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const service = await serviceModel
            .findById(serviceId)
            .populate('createdBy', 'name email role');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Service fetched successfully",
            service: service
        });

    } catch (err) {
        console.log("Error getting service by ID");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export default {createService, toggleServiceStatus, editService, addImages, deleteImage, setPrimaryImage, getAllServices, queryServices, getServiceById}
