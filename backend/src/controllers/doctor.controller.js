import consulationModel from "../models/consulation.model.js"
import uploadFileToImageKit from "../services/imagekit.service.js"
import userModel from "../models/user.model.js"
import appointmentModel from "../models/appointments.model.js"
import prescriptionModel from "../models/prescription.model.js"

const createConsultation = async(req,res)=>{
    
    try{

     
    const doctor = await userModel.findById(req.user.userId)
    
    if(!doctor || doctor.role !== "doctor" || !doctor.isActive){
        return res.status(404).json({
            success: false,            
            message: "Doctor not found or inactive"
        })}

    const {name,description,price,date,duration,buffer='0',startHour,startMinute,endHour,endMinute,category} = req.body
    const doctorId = req.user.userId

    const image = req.file ? req.file : null

    const imageUrl = await uploadFileToImageKit(image,"consultation_images")

    const startMinutes = parseInt(startHour)*60 + parseInt(startMinute)
    const endMinutes = parseInt(endHour)*60 + parseInt(endMinute)
    const durationNum = parseInt(duration)
    const bufferNum = parseInt(buffer)

    const consultationDate = new Date(date)

        const newConsultation = new consulationModel({
            doctorId,
            name,
            description,
            price,
            date: consultationDate,
            startMinutes,
            endMinutes,
            duration: durationNum,
            buffer: bufferNum,
            image: imageUrl,
            category
        })

        const slots = []
        let currentMinute = startMinutes

        while(currentMinute + durationNum <= endMinutes){
            slots.push({
                startMinute: currentMinute,
                endMinute: currentMinute + durationNum,
            })
            currentMinute += durationNum + bufferNum
        }

        newConsultation.slots = slots
        await newConsultation.save()
        
        return res.status(201).json({
            success: true,
            message: "Consultation created successfully",
            consultation: newConsultation
        })


    }catch(err){
        console.error("Error creating consultation:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const confirmConsultation = async(req,res)=>{
    try{

        const doctorId = req.user.userId
        const {consultationId,freeSlots} = req.body

        const consultation = await consulationModel.findOne({_id: consultationId, doctorId})

        if(!consultation){
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            })
        }

        const slots = consultation.slots

        freeSlots.forEach((slotId)=>{
            let index = -1
            index = slots.findIndex(s=>s._id.toString() === slotId)
            if(index !== -1){
                slots.splice(index,1)
                index = -1
            }

        })

        consultation.slots = slots
        consultation.isActive = true
        await consultation.save()

        return res.status(200).json({
            success: true,
            message: "Consultation confirmed successfully",
            consultation
        })




    }catch(err){
        console.error("Error confirming consultation:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getConfirmedAppointments = async(req,res)=>{
    try{
        const {consultationId} = req.params
        const doctorId = req.user.userId

        // Verify consultation exists and belongs to the doctor
        const consultation = await consulationModel.findOne({_id: consultationId, doctorId})

        if(!consultation){
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            })
        }

        // Get all confirmed appointments for this consultation
        const confirmedAppointments = await appointmentModel.find({
            consultationId,
            status: "CONFIRMED"
        }).populate('patientId', 'name email phone').sort({date: 1, startMinute: 1})

        return res.status(200).json({
            success: true,
            count: confirmedAppointments.length,
            appointments: confirmedAppointments
        })

    }catch(err){
        console.error("Error fetching confirmed appointments:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getTotalSlotsInConsultancy = async(req,res)=>{
    try{
        const {consultationId} = req.params
        const doctorId = req.user.userId

        // Verify consultation exists and belongs to the doctor
        const consultation = await consulationModel.findOne({_id: consultationId, doctorId})

        if(!consultation){
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            })
        }

        const totalSlots = consultation.slots.length

        return res.status(200).json({
            success: true,
            consultationId,
            totalSlots
        })

    }catch(err){
        console.error("Error fetching total slots:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getTotalConfirmedAppointments = async(req,res)=>{
    try{
        const {consultationId} = req.params
        const doctorId = req.user.userId

        // Verify consultation exists and belongs to the doctor
        const consultation = await consulationModel.findOne({_id: consultationId, doctorId})

        if(!consultation){
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            })
        }

        // Count confirmed appointments for this consultation
        const confirmedCount = await appointmentModel.countDocuments({
            consultationId,
            status: "CONFIRMED"
        })

        return res.status(200).json({
            success: true,
            consultationId,
            totalConfirmedAppointments: confirmedCount
        })

    }catch(err){
        console.error("Error fetching confirmed appointments count:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const addPrescription = async(req,res)=>{
    try{
        const doctorId = req.user.userId
        const {patientId, appointmentId, medicines, diagnosis, additionalNotes, followUpDate} = req.body

        // Verify doctor exists and is active
        const doctor = await userModel.findById(doctorId)
        if(!doctor || doctor.role !== "doctor" || !doctor.isActive){
            return res.status(404).json({
                success: false,
                message: "Doctor not found or inactive"
            })
        }

        // Verify appointment exists and belongs to the doctor
        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            doctorId,
            patientId,
            status: "CONFIRMED"
        })

        if(!appointment){
            return res.status(404).json({
                success: false,
                message: "Appointment not found or not confirmed"
            })
        }

        // Check if prescription already exists for this appointment
        const existingPrescription = await prescriptionModel.findOne({appointmentId})
        if(existingPrescription){
            return res.status(400).json({
                success: false,
                message: "Prescription already exists for this appointment"
            })
        }

        // Create new prescription
        const newPrescription = new prescriptionModel({
            doctorId,
            patientId,
            appointmentId,
            medicines,
            diagnosis,
            additionalNotes,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined
        })

        await newPrescription.save()

        return res.status(201).json({
            success: true,
            message: "Prescription added successfully",
            prescription: newPrescription
        })

    }catch(err){
        console.error("Error adding prescription:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const searchConsultations = async(req,res)=>{
    try{
        const {search, page = 1, limit = 9} = req.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const skip = (pageNum - 1) * limitNum

        let consultations
        let totalCount

        // If no search query provided, return all active consultations
        if(!search || search.trim().length === 0){
            totalCount = await consulationModel.countDocuments({ isActive: true })
            consultations = await consulationModel.find({
                isActive: true
            })
            .populate('doctorId', 'name email specialization')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
        } else {
            // Use MongoDB text search on indexed fields (name, description, category)
            const searchQuery = {
                isActive: true,
                $text: { $search: search }
            }
            totalCount = await consulationModel.countDocuments(searchQuery)
            consultations = await consulationModel.find(searchQuery)
            .populate('doctorId', 'name email specialization')
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limitNum)
        }

        return res.status(200).json({
            success: true,
            count: consultations.length,
            totalCount,
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            consultations
        })

    }catch(err){
        console.error("Error searching consultations:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getConsultationsByCategory = async(req,res)=>{
    try{
        const {category, page = 1, limit = 9} = req.query

        if(!category || category.trim().length === 0){
            return res.status(400).json({
                success: false,
                message: "Category is required"
            })
        }

        // Valid categories
        const validCategories = [
            "general_physician", "pediatrics", "gynecology", "dermatology",
            "orthopedics", "cardiology", "neurology", "psychiatry", "ent",
            "ophthalmology", "dentistry", "pulmonology", "endocrinology",
            "gastroenterology", "urology"
        ]

        if(!validCategories.includes(category)){
            return res.status(400).json({
                success: false,
                message: "Invalid category"
            })
        }

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const skip = (pageNum - 1) * limitNum

        const query = {
            isActive: true,
            category: category
        }

        const totalCount = await consulationModel.countDocuments(query)
        const consultations = await consulationModel.find(query)
            .populate('doctorId', 'name email specialization')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)

        return res.status(200).json({
            success: true,
            count: consultations.length,
            totalCount,
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            category,
            consultations
        })

    }catch(err){
        console.error("Error fetching consultations by category:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getPatientPrescriptions = async(req,res)=>{
    try{
        const doctorId = req.user.userId
        const {patientId} = req.params

        // Verify doctor exists and is active
        const doctor = await userModel.findById(doctorId)
        if(!doctor || doctor.role !== "doctor" || !doctor.isActive){
            return res.status(404).json({
                success: false,
                message: "Doctor not found or inactive"
            })
        }

        // Verify patient exists
        const patient = await userModel.findById(patientId)
        if(!patient){
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            })
        }

        // Get all prescriptions for this patient issued by this doctor
        const prescriptions = await prescriptionModel.find({
            doctorId,
            patientId
        }).populate('appointmentId', 'date startMinute endMinute status').sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: prescriptions.length,
            patientId,
            prescriptions
        })

    }catch(err){
        console.error("Error fetching patient prescriptions:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const updateConsultationStatus = async(req,res)=>{
    try{
        const doctorId = req.user.userId
        const {consultationId, isActive} = req.body

        // Verify consultation exists and belongs to the doctor
        const consultation = await consulationModel.findOne({
            _id: consultationId,
            doctorId
        })

        if(!consultation){
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            })
        }

        // Update isActive status
        consultation.isActive = isActive
        await consultation.save()

        return res.status(200).json({
            success: true,
            message: `Consultation ${isActive ? 'activated' : 'deactivated'} successfully`,
            consultation
        })

    }catch(err){
        console.error("Error updating consultation status:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getActiveDoctorConsultations = async(req, res) => {
    try {
        const { doctorId } = req.params;

        // Check if doctor exists and is active
        const doctor = await userModel.findOne({ _id: doctorId, role: "doctor", isActive: true });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found or inactive"
            });
        }

        // Find all active consultations for this doctor
        const consultations = await consulationModel.find({ 
            doctorId: doctorId, 
            isActive: true 
        })
        .populate("doctorId", "name email phone publicId category")
        .sort({ date: 1 });

        return res.status(200).json({
            success: true,
            message: "Active consultations fetched successfully",
            count: consultations.length,
            consultations
        });
    } catch(error) {
        console.log("Error fetching active doctor consultations:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// Get all active consultations for logged-in doctor
const getMyActiveConsultations = async(req, res) => {
    try {
        const doctorId = req.user.userId;

        // Check if doctor exists and is active
        const doctor = await userModel.findOne({ _id: doctorId, role: "doctor", isActive: true });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found or inactive"
            });
        }

        // Find all active consultations for this doctor
        const consultations = await consulationModel.find({ 
            doctorId: doctorId, 
            isActive: true 
        })
        .populate("doctorId", "name email phone publicId category")
        .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            message: "Active consultations fetched successfully",
            count: consultations.length,
            consultations
        });
    } catch(error) {
        console.log("Error fetching active consultations:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// Get all consultations (active and inactive) for logged-in doctor
const getAllMyConsultations = async(req, res) => {
    try {
        const doctorId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if doctor exists and is active
        const doctor = await userModel.findOne({ _id: doctorId, role: "doctor" });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Count total consultations
        const totalConsultations = await consulationModel.countDocuments({ doctorId });

        // Find all consultations for this doctor with pagination
        const consultations = await consulationModel.find({ doctorId })
            .populate("doctorId", "name email phone publicId category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalConsultations / limit);

        return res.status(200).json({
            success: true,
            message: "All consultations fetched successfully",
            pagination: {
                currentPage: page,
                totalPages,
                totalConsultations,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            consultations
        });
    } catch(error) {
        console.log("Error fetching all consultations:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// Get completed appointments for a consultation (for inactive consultations)
const getCompletedAppointments = async(req, res) => {
    try {
        const {consultationId} = req.params
        const doctorId = req.user.userId

        // Verify consultation exists and belongs to the doctor
        const consultation = await consulationModel.findOne({_id: consultationId, doctorId})

        if(!consultation){
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            })
        }

        // Get all completed appointments for this consultation
        const completedAppointments = await appointmentModel.find({
            consultationId,
            status: "COMPLETED"
        }).populate('patientId', 'name email phone').sort({date: 1, startMinute: 1})

        // Calculate total earnings
        const totalEarnings = completedAppointments.reduce((sum, appointment) => sum + appointment.price, 0)

        return res.status(200).json({
            success: true,
            count: completedAppointments.length,
            totalEarnings,
            consultation: {
                _id: consultation._id,
                name: consultation.name,
                description: consultation.description,
                category: consultation.category,
                price: consultation.price,
                date: consultation.date,
                image: consultation.image
            },
            appointments: completedAppointments
        })

    } catch(err) {
        console.error("Error fetching completed appointments:", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export default {
    createConsultation,
    confirmConsultation,
    getConfirmedAppointments,
    getTotalSlotsInConsultancy,
    getTotalConfirmedAppointments,
    addPrescription,
    searchConsultations,
    getConsultationsByCategory,
    getPatientPrescriptions,
    updateConsultationStatus,
    getActiveDoctorConsultations,
    getMyActiveConsultations,
    getAllMyConsultations,
    getCompletedAppointments
}