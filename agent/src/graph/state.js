import * as z from "zod";

export  const State = z.object({
  userId: z.string(),
  token: z.string().optional(),
  chatId: z.string(),

  intent: z.enum([
    "normal_chat",
    "doctor_appointment_query",
    "service_query",
    "appointment_booking",
    "service_booking"
  ]).optional(),

  category: z.string().optional(),

  user_message: z.string(),

  messages_history: z.array(
    z.string()
  ).default([]),

  reply_message_to_user: z.string().optional(),

  service_booking_essentials: z.object({
    serviceId: z.string().nullable().optional(),
    bookingStage: z.enum(["confirming_service", "booking", "booking_success", "booking_failed", "chat"]).default("chat"),
    available_services: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        id: z.string(),
        session_duration: z.string()
      })
    ).nullable().optional(),

    date: z.union([z.string(), z.date()]).nullable().optional(),
    startHour: z.number().min(0).max(23).nullable().optional(),
    startMinute: z.number().min(0).max(59).nullable().optional(),

    address: z.object({
      flatNumber: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      pincode: z.string().nullable().optional(),
      locality: z.string().nullable().optional()
    }).nullable().optional(),

    paymentId: z.string().nullable().optional(),
    bookingId: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    paymentStatus: z.string().nullable().optional(),
    paymentExpiresAt: z.union([z.string(), z.date()]).nullable().optional(),
  }).nullable().optional(),

  appointment_booking_essentials: z.object({
    date: z.date(),

    startHour: z.number().min(0).max(23),
    startMinute: z.number().min(0).max(59),

    appointmentId: z.string(),

    availableSlots: z.array(
      z.object({
        _id: z.string(),
        startMinute: z.number(),
        endMinute: z.number()
      })
    ),

    selectedSlotId: z.string(),

    paymentId: z.string().optional()
  }).optional()
}); 