import mongoose from "mongoose"

const connectToDB = async()=>{

try{
    await mongoose.connect(`${process.env.MONGO_URI}`)

    console.log(`db connect successfully to host ${mongoose.connection.host}`)

}

catch(error){
    console.log(`db connection failed: ${error}`)
}

}

export default connectToDB  