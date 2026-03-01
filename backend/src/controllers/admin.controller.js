import nurseServiceModel from "../models/nurseServiceRelation.model.js"
import userModel from "../models/user.model.js";
import nurseAvailabilityModel from "../models/nurseAvailability.model.js";
import leaveModel from "../models/leave.model.js";
import serviceModel from "../models/service.model.js";
import bookingModel from "../models/bookings.model.js";

const toggleNurseAccess = async (req, res) => {

    try{

        const { nurseId } = req.params;

        if(!nurseId){
            return res.status(400).json({message:"Nurse ID is required"})
        }

        const nurse = await userModel.findById(nurseId);

        if(!nurse || nurse.role !== "nurse"){
            return res.status(404).json({message:"Nurse not found"})
        }

        nurse.isActive = !nurse.isActive;
        await nurse.save();

        res.status(200).json({message:`Nurse access has been ${nurse.isActive ? "enabled" : "disabled"}.`, data: nurse})

    }catch(err){
        console.log("Error toggling id of nurse ",err);
        res.status(500).json({message:"Internal server error"})
    }

}

const assignServiceToNurse = async (req, res) => {


    try{

        const { nurseId, serviceId ,commissionPercentage = 20} = req.body;

        // Validate input
        if (!nurseId || !serviceId) {
            return res.status(400).json({ message: "Nurse ID and Service ID are required" });
        }

        const existingRelation = await nurseServiceModel.findOne({
            nurseId,
            serviceId
        })

        if (existingRelation) {
            
            return res.status(409).json({
            message: "Service already assigned to this nurse"
            })
        
        }

        const nurse = await userModel.findById(nurseId);
        
        if (!nurse || nurse.role !== "nurse") {
            return res.status(404).json({ message: "Nurse not found" });
        }

        // Create a new nurse-service relation
        const newRelation = await nurseServiceModel.create({
            nurseId,
            serviceId,
            assignedBy: req.user.userId, // Assuming req.user contains the authenticated admin's info
            commissionPercentage: commissionPercentage // Default commission percentage, can be modified as needed
        })

        res.status(201).json({ message: "Service assigned to nurse successfully", data: newRelation });


    }catch(error){

        console.error("Error assigning service to nurse:", error);
        res.status(500).json({ message: "Internal server error" });
    
    }


}

const toggleNurseService = async (req, res) => {


    try {

        const { nurseId,serviceId} = req.params;
        const relation = await nurseServiceModel.findOne({ nurseId, serviceId });

        if (!relation) {
            return res.status(404).json({ message: "Nurse-Service relation not found" });
        }

        relation.isActive = !relation.isActive;
        await relation.save();

        res.status(200).json({ message: `Nurse-Service relation has been ${relation.isActive ? "activated" : "deactivated"}.`, data: relation });
    }
    catch (error) {
        console.log("Error toggling nurse service:", error);
        res.status(500).json({ message: "Internal server error" });
    }


}

const assignTimeShift = async(req,res)=>{
    try{
        
    if(req.user.role!='admin'){
        return res.status(401).json({
            mess:"Insufficient permissions"
        })
    }

    const {nurseId,weeklyOffDays=[0],startHour,startMinute,endHour,endMinute} = req.body

    const startMinutes  = startHour*60+startMinute;
    const endMinutes = endHour*60+endMinute;
    
    if(endMinutes<=startMinutes){
        return res.status(400).json({
            mess:"Ending time must be greater than starting time"
        })
    }

    const nurseShift = await nurseAvailabilityModel.create({
        nurseId,
        weeklyOffDays,
        startMinutes,
        endMinutes,
        weeklyOffDays
    })

    res.status(200).json({
        mess:"Time shift assigned successfully",
        data:nurseShift    
    })
    }catch(err){

        console.log("Error assigning shift to nurse",err);
        return res.status(500).json({
            mess:"Internal server error"
        })
        
    }
}

const updateNurseTimeShift = async(req,res) => {
    try {
        const { nurseId } = req.params;
        const { weeklyOffDays, startHour, startMinute, endHour, endMinute } = req.body;

        // Check if nurse exists
        const nurse = await userModel.findById(nurseId);
        if (!nurse || nurse.role !== "nurse") {
            return res.status(404).json({ message: "Nurse not found" });
        }

        // Find existing shift
        const existingShift = await nurseAvailabilityModel.findOne({ nurseId });
        if (!existingShift) {
            return res.status(404).json({ message: "Nurse time shift not found. Please assign a shift first." });
        }

        // Calculate minutes if time is provided
        if (startHour !== undefined && startMinute !== undefined) {
            const startMinutes = startHour * 60 + startMinute;
            existingShift.startMinutes = startMinutes;
        }

        if (endHour !== undefined && endMinute !== undefined) {
            const endMinutes = endHour * 60 + endMinute;
            existingShift.endMinutes = endMinutes;
        }

        // Validate time range
        if (existingShift.endMinutes <= existingShift.startMinutes) {
            return res.status(400).json({ message: "Ending time must be greater than starting time" });
        }

        // Update weekly off days if provided
        if (weeklyOffDays !== undefined) {
            existingShift.weeklyOffDays = weeklyOffDays;
        }

        await existingShift.save();

        res.status(200).json({
            message: "Nurse time shift updated successfully",
            data: existingShift
        });

    } catch (err) {
        console.log("Error updating nurse shift:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAllNurses = async(req,res) => {
    try {
        const { isActive, page = 1, limit = 10 } = req.query;

        // Build filter
        const filter = { role: "nurse" };
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        // Pagination
        const skip = (page - 1) * limit;

        const nurses = await userModel
            .find(filter)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalNurses = await userModel.countDocuments(filter);

        res.status(200).json({
            message: "Nurses fetched successfully",
            data: nurses,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalNurses / limit),
                totalNurses,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching nurses:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getNurseStatusCounts = async(req,res) => {
    try {
        const [activeCount, inactiveCount] = await Promise.all([
            userModel.countDocuments({ role: "nurse", isActive: true }),
            userModel.countDocuments({ role: "nurse", isActive: false })
        ])

        return res.status(200).json({
            message: "Nurse status counts fetched successfully",
            data: {
                active: activeCount,
                inactive: inactiveCount
            }
        })

    } catch (err) {
        console.log("Error fetching nurse status counts:", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const getNurseAssignedServices = async(req,res) => {
    try {
        const { nurseId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const nurse = await userModel.findById(nurseId).select('name email phone image publicId role');

        if (!nurse || nurse.role !== "nurse") {
            return res.status(404).json({ message: "Nurse not found" });
        }

        const skip = (page - 1) * limit;

        const [assignments, totalAssignments] = await Promise.all([
            nurseServiceModel
                .find({ nurseId })
                .populate('serviceId', 'name category price isActive sessionDuration')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            nurseServiceModel.countDocuments({ nurseId })
        ]);

        const formattedAssignments = assignments.map(relation => ({
            relationId: relation._id,
            service: relation.serviceId,
            isActive: relation.isActive,
            commissionPercentage: relation.commissionPercentage,
            assignedAt: relation.createdAt,
            updatedAt: relation.updatedAt
        }));

        return res.status(200).json({
            message: "Assigned services fetched successfully",
            nurse,
            assignments: formattedAssignments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalAssignments / limit),
                totalAssignments,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching nurse assigned services:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const searchNursesByName = async(req,res) => {
    try {
        const { name, page = 1, limit = 10 } = req.query;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Nurse name is required" });
        }

        const filter = {
            role: "nurse",
            name: { $regex: name.trim(), $options: 'i' }
        };

        const skip = (page - 1) * limit;

        const nurses = await userModel
            .find(filter)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 });

        const totalNurses = await userModel.countDocuments(filter);

        return res.status(200).json({
            message: "Nurses fetched successfully",
            data: nurses,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalNurses / limit),
                totalNurses,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error searching nurses by name:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getNursesByService = async(req,res) => {
    try {
        const { serviceId } = req.params;
        const { isActive, page = 1, limit = 10 } = req.query;

        if (!serviceId) {
            return res.status(400).json({ message: "Service ID is required" });
        }

        // Build filter for nurse-service relation
        const filter = { serviceId };
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Find nurse-service relations and populate nurse details
        const nurseServiceRelations = await nurseServiceModel
            .find(filter)
            .populate({
                path: 'nurseId',
                select: '-password',
                match: { role: 'nurse' }
            })
            .populate('serviceId', 'name category price')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Filter out null nurses (in case some were deleted)
        const validRelations = nurseServiceRelations.filter(rel => rel.nurseId !== null);

        const totalCount = await nurseServiceModel.countDocuments(filter);

        res.status(200).json({
            message: "Nurses for service fetched successfully",
            data: validRelations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalRecords: totalCount,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching nurses by service:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getServiceAssignmentsByService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { isActive, page = 1, limit = 10 } = req.query;

        const service = await serviceModel.findById(serviceId).select('name category price isActive sessionDuration');

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const filter = { serviceId };
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        const relations = await nurseServiceModel
            .find(filter)
            .populate({
                path: 'nurseId',
                select: 'name email phone image publicId isActive role experienceYears specialization'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Fetch availability data for all nurses in this batch
        const nurseIds = relations
            .filter((relation) => relation.nurseId)
            .map((relation) => relation.nurseId._id);

        const availabilities = await nurseAvailabilityModel.find({
            nurseId: { $in: nurseIds }
        }).select('nurseId startMinutes endMinutes weeklyOffDays');

        // Create a map for quick lookup
        const availabilityMap = {};
        availabilities.forEach((avail) => {
            availabilityMap[avail.nurseId.toString()] = {
                startMinutes: avail.startMinutes,
                endMinutes: avail.endMinutes,
                weeklyOffDays: avail.weeklyOffDays || []
            };
        });

        const assignments = relations
            .filter((relation) => relation.nurseId)
            .map((relation) => {
                const nurseIdStr = relation.nurseId._id.toString();
                return {
                    relationId: relation._id,
                    serviceId: relation.serviceId,
                    nurseId: relation.nurseId._id,
                    nurse: relation.nurseId,
                    availability: availabilityMap[nurseIdStr] || null,
                    isActive: relation.isActive,
                    commissionPercentage: relation.commissionPercentage,
                    assignedAt: relation.createdAt,
                    updatedAt: relation.updatedAt
                };
            });

        const totalRecords = await nurseServiceModel.countDocuments(filter);

        return res.status(200).json({
            message: "Service assignments fetched successfully",
            service,
            assignments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRecords / limit) || 1,
                totalRecords,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching service assignments:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getConfirmedBookingsByService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        const service = await serviceModel.findById(serviceId).select('name category price isActive sessionDuration');

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const filter = { serviceId, status: "CONFIRMED" };

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({ message: "Invalid startDate" });
            }
            filter.date = { ...(filter.date || {}), $gte: start };
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid endDate" });
            }
            filter.date = { ...(filter.date || {}), $lte: end };
        }

        const skip = (page - 1) * limit;

        const bookings = await bookingModel
            .find(filter)
            .populate('nurseId', 'name email phone publicId image')
            .populate('userId', 'name email phone')
            .sort({ date: -1, startMinutes: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalBookings = await bookingModel.countDocuments(filter);

        return res.status(200).json({
            message: "Confirmed bookings fetched successfully",
            service,
            bookings,
            filters: {
                startDate: startDate || null,
                endDate: endDate || null
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalBookings / limit) || 1,
                totalRecords: totalBookings,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching confirmed bookings:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const disableServiceForNurse = async(req,res) => {
    try {
        const { nurseId, serviceId } = req.params;

        const relation = await nurseServiceModel.findOne({ nurseId, serviceId });

        if (!relation) {
            return res.status(404).json({ message: "Nurse-Service relation not found" });
        }

        relation.isActive = false;
        await relation.save();

        res.status(200).json({
            message: "Service disabled for nurse successfully",
            data: relation
        });

    } catch (err) {
        console.log("Error disabling service for nurse:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const enableServiceForNurse = async(req,res) => {
    try {
        const { nurseId, serviceId } = req.params;

        const relation = await nurseServiceModel.findOne({ nurseId, serviceId });

        if (!relation) {
            return res.status(404).json({ message: "Nurse-Service relation not found" });
        }

        relation.isActive = true;
        await relation.save();

        res.status(200).json({
            message: "Service enabled for nurse successfully",
            data: relation
        });

    } catch (err) {
        console.log("Error enabling service for nurse:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const searchNurseByPublicId = async(req,res) => {
    try {
        const { publicId } = req.params;
        console.log(publicId);
        
        const nurse = await userModel.findOne({ 
            publicId: parseInt(publicId), 
            role: "nurse" 
        }).select('-password');

        if (!nurse) {
            return res.status(404).json({ 
                message: "Nurse not found with this Public ID" 
            });
        }

        // Optionally get nurse's assigned services and availability
        const assignedServices = await nurseServiceModel
            .find({ nurseId: nurse._id, isActive: true })
            .populate('serviceId');

        const availability = await nurseAvailabilityModel.findOne({ nurseId: nurse._id });

        res.status(200).json({
            message: "Nurse found successfully",
            data: {
                nurse,
                assignedServices,
                availability
            }
        });

    } catch (err) {
        console.log("Error searching nurse by public ID:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Leave Management Controllers

// Get all pending leave applications
const getPendingLeaves = async(req,res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Fetch leave requests
        const leaves = await leaveModel
            .find({ status: "PENDING" })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        // Extract unique nurse IDs
        const nurseIds = [...new Set(leaves.map(leave => leave.nurseId))];

        // Fetch nurse details
        const nurses = await userModel
            .find({ _id: { $in: nurseIds } })
            .select('name email image publicId')
            .lean();

        // Create a map for quick nurse lookup
        const nurseMap = {};
        nurses.forEach(nurse => {
            nurseMap[nurse._id.toString()] = {
                name: nurse.name,
                email: nurse.email,
                image: nurse.image,
                publicId: nurse.publicId
            };
        });

        // Map leaves with nurse details
        const leavesWithNurseDetails = leaves.map(leave => ({
            _id: leave._id,
            nurseId: leave.nurseId,
            nurseName: nurseMap[leave.nurseId.toString()]?.name || 'Unknown',
            nurseEmail: nurseMap[leave.nurseId.toString()]?.email || '',
            nurseImage: nurseMap[leave.nurseId.toString()]?.image || '',
            nursePublicId: nurseMap[leave.nurseId.toString()]?.publicId || null,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
        }));

        const totalLeaves = await leaveModel.countDocuments({ status: "PENDING" });

        res.status(200).json({
            message: "Pending leaves fetched successfully",
            data: leavesWithNurseDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalLeaves / limit),
                totalLeaves,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching pending leaves:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Search leaves by nurse name
const searchLeavesByNurseName = async(req,res) => {
    try {
        const { name } = req.query;
        const { page = 1, limit = 10 } = req.query;

        if (!name) {
            return res.status(400).json({ message: "Nurse name is required" });
        }

        // First find nurses matching the name
        const nurses = await userModel.find({
            role: "nurse",
            name: { $regex: name, $options: 'i' }
        }).select('name email image publicId').lean();

        const nurseIds = nurses.map(nurse => nurse._id);

        if (nurseIds.length === 0) {
            return res.status(404).json({ 
                message: "No nurses found with this name",
                data: []
            });
        }

        const skip = (page - 1) * limit;

        // Fetch leave requests
        const leaves = await leaveModel
            .find({ nurseId: { $in: nurseIds } })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        // Create a map for quick nurse lookup
        const nurseMap = {};
        nurses.forEach(nurse => {
            nurseMap[nurse._id.toString()] = {
                name: nurse.name,
                email: nurse.email,
                image: nurse.image,
                publicId: nurse.publicId
            };
        });

        // Map leaves with nurse details
        const leavesWithNurseDetails = leaves.map(leave => ({
            _id: leave._id,
            nurseId: leave.nurseId,
            nurseName: nurseMap[leave.nurseId.toString()]?.name || 'Unknown',
            nurseEmail: nurseMap[leave.nurseId.toString()]?.email || '',
            nurseImage: nurseMap[leave.nurseId.toString()]?.image || '',
            nursePublicId: nurseMap[leave.nurseId.toString()]?.publicId || null,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
        }));

        const totalLeaves = await leaveModel.countDocuments({ nurseId: { $in: nurseIds } });

        res.status(200).json({
            message: "Leaves fetched successfully",
            data: leavesWithNurseDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalLeaves / limit),
                totalLeaves,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error searching leaves by nurse name:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Search leaves by nurse public ID
const searchLeavesByPublicId = async(req,res) => {
    try {
        const { publicId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const nurse = await userModel.findOne({ 
            publicId: parseInt(publicId),
            role: "nurse"
        }).select('name email image publicId').lean();

        if (!nurse) {
            return res.status(404).json({ 
                message: "Nurse not found with this Public ID",
                data: []
            });
        }

        const skip = (page - 1) * limit;

        // Fetch leave requests
        const leaves = await leaveModel
            .find({ nurseId: nurse._id })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        // Map leaves with nurse details
        const leavesWithNurseDetails = leaves.map(leave => ({
            _id: leave._id,
            nurseId: leave.nurseId,
            nurseName: nurse.name,
            nurseEmail: nurse.email,
            nurseImage: nurse.image,
            nursePublicId: nurse.publicId,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
        }));

        const totalLeaves = await leaveModel.countDocuments({ nurseId: nurse._id });

        res.status(200).json({
            message: "Leaves fetched successfully",
            data: leavesWithNurseDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalLeaves / limit),
                totalLeaves,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error searching leaves by public ID:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Get all nurses on leave on a particular date
const getNursesOnLeaveByDate = async(req,res) => {
    try {
        const { date } = req.query;
        const { page = 1, limit = 10 } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const searchDate = new Date(date);
        
        if (isNaN(searchDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const skip = (page - 1) * limit;

        // Find leaves where the date falls between startDate and endDate
        const leaves = await leaveModel
            .find({
                status: "APPROVED",
                startDate: { $lte: searchDate },
                endDate: { $gte: searchDate }
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ startDate: 1 })
            .lean();

        // Extract unique nurse IDs
        const nurseIds = [...new Set(leaves.map(leave => leave.nurseId))];

        // Fetch nurse details
        const nurses = await userModel
            .find({ _id: { $in: nurseIds } })
            .select('name email image publicId')
            .lean();

        // Create a map for quick nurse lookup
        const nurseMap = {};
        nurses.forEach(nurse => {
            nurseMap[nurse._id.toString()] = {
                name: nurse.name,
                email: nurse.email,
                image: nurse.image,
                publicId: nurse.publicId
            };
        });

        // Map leaves with nurse details
        const leavesWithNurseDetails = leaves.map(leave => ({
            _id: leave._id,
            nurseId: leave.nurseId,
            nurseName: nurseMap[leave.nurseId.toString()]?.name || 'Unknown',
            nurseEmail: nurseMap[leave.nurseId.toString()]?.email || '',
            nurseImage: nurseMap[leave.nurseId.toString()]?.image || '',
            nursePublicId: nurseMap[leave.nurseId.toString()]?.publicId || null,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
        }));

        const totalLeaves = await leaveModel.countDocuments({
            status: "APPROVED",
            startDate: { $lte: searchDate },
            endDate: { $gte: searchDate }
        });

        res.status(200).json({
            message: `Nurses on leave on ${date} fetched successfully`,
            data: leavesWithNurseDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalLeaves / limit),
                totalNursesOnLeave: totalLeaves,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log("Error fetching nurses on leave by date:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getLeaveCountByDate = async (req, res) => {
    try {
        const { date } = req.query

        if (!date) {
            return res.status(400).json({ message: "Date is required" })
        }

        const searchDate = new Date(date)
        if (isNaN(searchDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" })
        }

        const totalOnLeave = await leaveModel.countDocuments({
            status: "APPROVED",
            startDate: { $lte: searchDate },
            endDate: { $gte: searchDate }
        })

        return res.status(200).json({
            message: `Leave count for ${date} fetched successfully`,
            data: {
                date,
                totalOnLeave
            }
        })
    } catch (err) {
        console.log("Error fetching leave count by date:", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}


const updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { status } = req.body;

        // Find the leave request
        const leave = await leaveModel.findById(leaveId);

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        // Check if leave is already processed
        if (leave.status !== "PENDING") {
            return res.status(400).json({ 
                message: `Leave request has already been ${leave.status.toLowerCase()}` 
            });
        }

        // Update leave status
        leave.status = status;
        await leave.save();

        // Fetch nurse details for response
        const nurse = await userModel.findById(leave.nurseId).select('name email publicId');

        res.status(200).json({
            message: `Leave request ${status.toLowerCase()} successfully`,
            data: {
                _id: leave._id,
                nurseId: leave.nurseId,
                nurseName: nurse?.name || 'Unknown',
                nurseEmail: nurse?.email || '',
                nursePublicId: nurse?.publicId || null,
                startDate: leave.startDate,
                endDate: leave.endDate,
                reason: leave.reason,
                status: leave.status,
                updatedAt: leave.updatedAt
            }
        });

    } catch (err) {
        console.log("Error updating leave status:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAllDoctors = async(req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Get total count of doctors
        const totalDoctors = await userModel.countDocuments({ role: "doctor" });

        // Fetch all doctors with pagination
        const doctors = await userModel.find({ role: "doctor" })
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalDoctors / limit);

        return res.status(200).json({
            success: true,
            message: "Doctors fetched successfully",
            pagination: {
                currentPage: page,
                totalPages,
                totalDoctors,
                doctorsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            doctors
        });

    } catch(error) {
        console.log("Error fetching all doctors:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const toggleDoctorAccess = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }

        const doctor = await userModel.findById(doctorId);

        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.isActive = !doctor.isActive;
        await doctor.save();

        res.status(200).json({
            message: `Doctor access has been ${doctor.isActive ? "enabled" : "disabled"}.`,
            data: doctor
        });

    } catch (err) {
        console.log("Error toggling doctor access:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const searchDoctorsByName = async (req, res) => {
    try {
        const { name } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const searchRegex = new RegExp(name.trim(), 'i');
        
        const query = {
            role: "doctor",
            name: searchRegex
        };

        const totalDoctors = await userModel.countDocuments(query);

        const doctors = await userModel.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalDoctors / limit);

        return res.status(200).json({
            success: true,
            message: "Doctors fetched successfully",
            pagination: {
                currentPage: page,
                totalPages,
                totalDoctors,
                doctorsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            doctors
        });

    } catch (error) {
        console.log("Error searching doctors:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export default {
    assignServiceToNurse,
    toggleNurseService,
    toggleNurseAccess,
    assignTimeShift,
    updateNurseTimeShift,
    getAllNurses,
    getNurseStatusCounts,
    getNurseAssignedServices,
    searchNursesByName,
    getNursesByService,
    getServiceAssignmentsByService,
    getConfirmedBookingsByService,
    disableServiceForNurse,
    enableServiceForNurse,
    searchNurseByPublicId,
    getPendingLeaves,
    searchLeavesByNurseName,
    searchLeavesByPublicId,
    getNursesOnLeaveByDate,
    getLeaveCountByDate,
    updateLeaveStatus,
    getAllDoctors,
    toggleDoctorAccess,
    searchDoctorsByName
}