import {
  StateGraph,
  START,
  END
} from "@langchain/langgraph";

import {
  intent,
  normalChat,
  queryService,
  queryAppointment,
  searchServiceForBooking,
  booking,
  appointment_booking,
} from "./nodes.js";

import { State } from "./state.js";

const graph = new StateGraph(State);

const getCurrentIntent = (state) => {
  // const bookingStage = state.service_booking_essentials?.bookingStage;
  // if (bookingStage === "booking") {
  //   return "final_booking";
  // }
  return state.intent;
};

const routeEntry = (state) => {
  const bookingStage = state.service_booking_essentials?.bookingStage;
  const { intent } = state;

  if (bookingStage === "booking") {
    return "final_booking";
  }

  if (!intent) {
    return "intent";
  }

  if (intent === "service_booking" && bookingStage === "chat") {
    return "service_search_booking";
  } 

  return "intent";
};

// 1. Add all nodes
graph.addNode("intent_node", intent);
graph.addNode("appointment_query", queryAppointment);
graph.addNode("service_query", queryService);
graph.addNode("appointment_booking", appointment_booking);
graph.addNode("service_search_booking", searchServiceForBooking);
graph.addNode("normal_chat", normalChat);
graph.addNode("final_booking", booking);

// 2. START conditional routing
graph.addConditionalEdges(
  START,
  routeEntry,
  {
    intent: "intent_node",
    service_search_booking: "service_search_booking",
    final_booking: "final_booking"
  }
);

// 3. Intent node conditional routing
graph.addConditionalEdges(
  "intent_node",
  getCurrentIntent,
  {
    normal_chat: "normal_chat",
    doctor_appointment_query: "appointment_query",
    service_query: "service_query",
    appointment_booking: "appointment_booking",
    service_booking: "service_search_booking",
    final_booking: "final_booking",
  }
);

// 4. End edges
graph.addEdge("normal_chat", END);
graph.addEdge("appointment_query", END);
graph.addEdge("service_query", END);
graph.addEdge("service_search_booking", END);
graph.addEdge("appointment_booking", END);
graph.addEdge("final_booking", END);

export const healthcareGraph = graph.compile();
