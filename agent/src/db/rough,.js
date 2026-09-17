 import axios from "axios"
 const searchServiceForBooking = async(State) =>{

    let {category,service_booking_essentials} = State;
    
    if(category=="null") category = null
    
    const response = await axios.get(
    `http://localhost:5003/api/services/search?search=${category}`,
    );

   const available_services = response.data.services
      .filter((service) => service.isActive)
      .map((service) => ({
        name: service.name,
        description: service.description,
        price: service.price,
        id: service._id,
        session_duration: `${service.sessionDuration} minutes`,
      }))
  
    console.log(available_services);
    
   return {
    category:category,
    service_booking_essentials: {
    ...State.service_booking_essentials,
    bookingStage: "confirming_service",
    available_services
  }
}
}

await searchServiceForBooking({category:"null"})