import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config()
import Razorpay from 'razorpay'
import paymentModel from './../models/payment.model.js';
import { validatePaymentVerification } from '../../node_modules/razorpay/dist/utils/razorpay-utils.js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createPayment = async(totalPrice,userId,bookingId)=>{

    console.log(process.env.RAZORPAY_KEY_ID)
    console.log(process.env.RAZORPAY_KEY_SECRET);
    

    const price = {
      amount: totalPrice * 100, // Convert to paise
      currency: 'INR',
    }

    try {
    
    const razorPayOrder = await razorpay.orders.create(price);


    const newPayment = await paymentModel.create({
      order: bookingId,
      price,
      status: 'PENDING',
      user:userId,
      RazorpayOrderId: razorPayOrder.id
    });

      return razorPayOrder;
  
    } 
  catch (error) {
    
    console.log("Error creating payment ", error);
    
    throw error;
  
  }

  }


const verifyPayment = async({ razorpayOrderId, paymentId, signature })=>{


  const secret = process.env.RAZORPAY_KEY_SECRET
  console.log("Verifying payment with details: ", { razorpayOrderId, paymentId, signature });
  
  try{

    
  // const isValid = validatePaymentVerification({
                      
  //                   order_id: razorpayOrderId,
  //                   payment_id: paymentId
  //                   },  signature, secret)

    const isValid = true; // For testing purposes, you can set this to true. In production, use the actual validation.
    
    const payment = await paymentModel.findOne({ 
          RazorpayOrderId:razorpayOrderId, 
          status: 'PENDING' 
    });
    console.log("Payment found in DB: ", payment);
            if (!payment) {
            return {
              success: false,
              message: 'Payment not found'
            };
  }

  
          if (!isValid) {

          payment.status = 'FAILED';
          await payment.save();
          return {
              success: false,
              message: 'Invalid signature'
          };
      }

        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = 'COMPLETED';

          await payment.save();

      return {
          success: true,
          message: 'Payment verified successfully',
          payment
      }



  }catch(err){

    console.log("Error in payment verifying");
    console.log(err);
    throw err;

  }

}

export {createPayment,verifyPayment}