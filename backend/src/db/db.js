import mongoose from "mongoose";

async function connectDB() {
    try{
        
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully");
        

    }
    catch(error){

        console.error("Database connection failed ❌");
        console.log(error);
        
    
    }
}

export default connectDB;