import mongoose from "mongoose"


const paymentSchema = new mongoose.Schema({

    order:{type:mongoose.Schema.Types.ObjectId,required:true}, //this is order id from our order service
    paymentId:{type:String},
    RazorpayOrderId:{type:String},
    signature:{type:String},
    status:{type:String,enum:['PENDING','COMPLETED','FAILED'],default:'PENDING'},
    user:{type:mongoose.Schema.Types.ObjectId,required:true},
    price:{
        amount:{
            type:Number,
            min:1
        },
        currency:{
            type:String,
            enum:["INR","USD"],
            default:"INR"
        }
    }

},{timestamps:true})

const paymentModel = mongoose.model("payment",paymentSchema)

export default paymentModel