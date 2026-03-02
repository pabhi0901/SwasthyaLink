import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import uploadFileToImageKit from "../services/imagekit.service.js";
import crypto from "crypto";
import { log } from "console";

// Helper function to generate a unique 12-digit publicId
const generateUniquePublicId = async () => {
    let publicId;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random 12-digit number (100000000000 to 999999999999)
        const randomBytes = crypto.randomBytes(6);
        const randomNumber = parseInt(randomBytes.toString('hex'), 16);
        publicId = Math.floor(100000000000 + (randomNumber % 900000000000));

        // Check if this publicId already exists
        const existingUser = await userModel.findOne({ publicId });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return publicId;
};


//register normal customers
const registerUser = async(req, res) => {

    try{
    
        const { name, email, password, phone ,addresses} = req.body    

        const image = req.file ? req.file : null

        let user = await userModel.findOne({ email })

        if(user){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        console.log("Callig fn");
        
        let imageUrl = null;
        console.log(image);
        
        //uploading image to imagekit and getting the url
        if(image?.buffer)  imageUrl = await uploadFileToImageKit(image,"profile_pics")     
        
        console.log("all good");
        
        const hashedPassword = await bcrypt.hash(password, 10)

        // Generate unique publicId
        const publicId = await generateUniquePublicId();

        user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            image:imageUrl,
            addresses,
            publicId
        })

     const token = jwt.sign({ 
        userId: user._id,
        name: user.name,
        role:user.role
     }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none", //none in production and lax in local development
        secure: true, // Set to true in production with HTTPS,false in local development
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user:{
            user:user.name,
            email:user.email,
            phone:user.phone,
            image:user.image,
            role:user.role,
            addresses:user.addresses,
        }
    }
)}
    catch(error){

        console.log(error);

        return res.status(501).json({
            success: false,
            message: "User registration failed",
        })

        

    }
}

//login for all users (admin,nurse,customer)
const loginUser = async(req, res) => {
    
    try{

        const { email, password} = req.body

    const user = await userModel.findOne({ email }).select("+password")

    if(!user){

        return res.status(400).json({
            mess:"Invalid email or password"
        })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
   
    if(!passwordMatch){
        return res.status(400).json({
            mess:"Invalidation"
        })
    }

    const token = jwt.sign({ 
        userId: user._id,
        name: user.name,
        role:user.role
     }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none", //none in production with https,lax in local development
        secure: true, // Set to true in production with HTTPS,false in local development
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
        success: true,
        message: "User logged in successfully",
        user:{
            user:user.name,
            email:user.email,
            phone:user.phone,
            image:user.image,
            role:user.role,
            addresses:user.addresses,
        }

    })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            mess:"Internal Server Error"
        })
    }
}

//register a nurse 
const registerNurse = async(req,res)=>{
    
    try{

        const role = req.user.role

        if(role !== "admin"){
            return res.status(403).json({
                success:false,
                message:"Only admins can register nurses"
            })
        }

        const { name, email, password, phone } = req.body;

        let user = await userModel.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "Nurse already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique publicId
        const publicId = await generateUniquePublicId();

        user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "nurse",
            publicId
        })

        return res.status(201).json({
            success: true,
            message: "Nurse registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })



    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            mess:"Internal Server Error"
        })
        
    }
}

const registerDoctor = async(req,res)=>{
    
    try{

        const role = req.user.role

        if(role !== "admin"){
            return res.status(403).json({
                success:false,
                message:"Only admins can register doctors"
            })
        }

        const { name, email, password, phone, category } = req.body;

        let user = await userModel.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "Doctor already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique publicId
        const publicId = await generateUniquePublicId();

        user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "doctor",
            publicId,
            category
        })

        return res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                publicId: user.publicId,
                category: user.category
            }
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
        
    }
}

// Add a new address to user account
const addAddress = async (req, res) => {
    try {
        const { flatNumber, locality, city, state, pincode } = req.body;
        const userId = req.user.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const newAddress = {
            flatNumber,
            locality,
            city,
            state,
            pincode
        };

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: user.addresses[user.addresses.length - 1]
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to add address"
        });
    }
};

// Get all addresses of a user
const getAllAddresses = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userModel.findById(userId).select('addresses');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            addresses: user.addresses
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
};

// Edit an existing address
const editAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Update only the fields that are provided
        if (updates.flatNumber) address.flatNumber = updates.flatNumber;
        if (updates.locality) address.locality = updates.locality;
        if (updates.city) address.city = updates.city;
        if (updates.state) address.state = updates.state;
        if (updates.pincode) address.pincode = updates.pincode;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update address"
        });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Remove the address
        address.deleteOne();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    }
};

// Update user profile (name and phone)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// Update user image
const updateImage = async (req, res) => {
    try {
        const userId = req.user.userId;
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Upload image to ImageKit
        const imageUrl = await uploadFileToImageKit(image, "profile_pics");
        user.image = imageUrl;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            image: user.image
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile image"
        });
    }
};

// Change user password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await userModel.findById(userId).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to logout"
        });
    }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
                role: user.role,
                publicId: user.publicId,
                isActive: user.isActive,
                addresses: user.addresses,
                specialization: user.specialization,
                category: user.category,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        });
    }
};

export default {registerUser, loginUser, registerNurse, registerDoctor, logout, getCurrentUser, addAddress, getAllAddresses, editAddress, deleteAddress, updateProfile, updateImage, changePassword}
