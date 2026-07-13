import { BookingStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateBooking } from "./booking.interface";

// ===============================
// Get User Bookings
// ===============================


const getMyBookingsFromDB = async(
  userId:string
)=>{


  const bookings =
    await prisma.booking.findMany({

      where:{
        customerId:userId
      },

      orderBy:{
        createdAt:"desc"
      },

      include:{

        technicianService:{

          select:{

            price:true,
            pricingType:true,
            estimatedDuration:true,

            service:{
              select:{
                name:true,
                description:true
              }
            },


            technician:{

              select:{

                user:{
                  select:{
                    id:true,
                    name:true,
                    phone:true,
                    profileImage:true
                  }
                },

                averageRating:true,
                totalReviews:true
              }
            }
          }
        }
      }
    });

  return bookings.map((booking)=>({

    id:booking.id,
    bookingNumber:
      booking.bookingNumber,
    bookingDate:
      booking.bookingDate,
    scheduledStart:
      booking.scheduledStart,
    scheduledEnd:
      booking.scheduledEnd,
    serviceAddress:
      booking.serviceAddress,
    totalAmount:
      booking.totalAmount,
    status:
      booking.status,

    service:{

      name:
      booking.technicianService.service.name,
      price:
      booking.technicianService.price,
      pricingType:
      booking.technicianService.pricingType
    },

    technician:{

      name:
      booking.technicianService.technician.user.name,
      phone:
      booking.technicianService.technician.user.phone,
      profileImage:
      booking.technicianService.technician.user.profileImage,
      rating:
      booking.technicianService.technician.averageRating
    }
  }));
};


// ===============================
// Get Single Booking Details
// ===============================
const getBookingByIdFromDB =
async(
  userId:string,
  bookingId:string
)=>{


  const booking =
    await prisma.booking.findFirst({

      where:{
        id:bookingId,        customerId:userId
      },

      include:{

        technicianService:{

          include:{
            service:true,
            technician:{
              
              include:{
                user:true
              }

            }

          }

        },

        payment:true,
        review:true
      }

    });

  if(!booking){

    throw new Error(
      "Booking not found."
    );

  }



  return {

    id:booking.id,
    bookingNumber:
      booking.bookingNumber,
    bookingDate:
      booking.bookingDate,
    scheduledStart:
      booking.scheduledStart,
    scheduledEnd:
      booking.scheduledEnd,
    serviceAddress:
      booking.serviceAddress,
    totalAmount:
      booking.totalAmount,
    status:
      booking.status,
    notes:
      booking.notes,

    service:{

      name:
      booking.technicianService.service.name,
      description:
      booking.technicianService.service.description,
      price:
      booking.technicianService.price,
      pricingType:
      booking.technicianService.pricingType

    },

    technician:{

      id:
      booking.technicianService.technician.id,
      name:
      booking.technicianService.technician.user.name,
      phone:
      booking.technicianService.technician.user.phone,
      profileImage:
      booking.technicianService.technician.user.profileImage,
      rating:
      booking.technicianService.technician.averageRating

    },

    payment:
      booking.payment,
    review:
      booking.review
  };

};

// Create Booking
export const createBookingIntoDB = async (
  userId: string,
  payload: ICreateBooking,
) => {
  const {
    technicianServiceId,
    bookingDate,
    scheduledStart,
    scheduledEnd,
    serviceAddress,
    latitude,
    longitude,
    notes,
  } = payload;

  // =========================
  // Required Field Validation
  // =========================

  if (
    !technicianServiceId ||
    !bookingDate ||
    !scheduledStart ||
    !scheduledEnd ||
    !serviceAddress
  ) {
    throw new Error("Please provide all required fields.");
  }

  // =========================
  // Address Validation
  // =========================

  if (serviceAddress.trim().length < 10) {
    throw new Error("Service address must be at least 10 characters.");
  }

  // =========================
  // Date Validation
  // =========================

  const bookingDateObj = new Date(bookingDate);
  const startTime = new Date(scheduledStart);
  const endTime = new Date(scheduledEnd);

  if (isNaN(bookingDateObj.getTime())) {
    throw new Error("Invalid booking date.");
  }

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new Error("Invalid schedule time.");
  }

  if (startTime >= endTime) {
    throw new Error("Scheduled end time must be after start time.");
  }

  // Booking date cannot be past

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDateObj < today) {
    throw new Error("Booking date cannot be in the past.");
  }

  // =========================
  // Technician Service Check
  // =========================

  const technicianService = await prisma.technicianService.findUnique({
    where: {
      id: technicianServiceId,
    },

    include: {
      service: true,

      technician: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!technicianService) {
    throw new Error("Technician service not found.");
  }

  if (technicianService.status !== "ACTIVE") {
    throw new Error("This service is currently unavailable.");
  }

  if (technicianService.technician.availabilityStatus !== "ONLINE") {
    throw new Error("Technician is currently unavailable.");
  }

  // =========================
  // Technician Time Slot Check
  // =========================

  const existingBooking = await prisma.booking.findFirst({
    where: {
      technicianServiceId,

      bookingDate: bookingDateObj,

      status: {
        in: ["PENDING", "ACCEPTED", "IN_PROGRESS"],
      },

      AND: [
        {
          scheduledStart: {
            lt: endTime,
          },
        },

        {
          scheduledEnd: {
            gt: startTime,
          },
        },
      ],
    },
  });

  if (existingBooking) {
    throw new Error(
      "This technician is already booked for this time slot. Please select another time.",
    );
  }

  // =========================
  // Customer Duplicate Booking Check
  // =========================

  const customerBooking = await prisma.booking.findFirst({
    where: {
      customerId: userId,
      bookingDate: bookingDateObj,
      status: {
        in: [
          BookingStatus.PENDING,
          BookingStatus.ACCEPTED,
          BookingStatus.IN_PROGRESS,
        ],
      },

      AND: [
        {
          scheduledStart: {
            lt: endTime,
          },
        },

        {
          scheduledEnd: {
            gt: startTime,
          },
        },
      ],
    },
  });

  if (customerBooking) {
    throw new Error("You already have a booking during this time slot.");
  }

  // =========================
  // Create Booking
  // =========================

  const bookingNumber = `BK-${Date.now()}`;

  const booking = await prisma.booking.create({
    data: {
      customerId: userId,
      technicianServiceId,
      bookingNumber,
      bookingDate: bookingDateObj,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      serviceAddress,
      latitude,
      longitude,
      totalAmount: technicianService.price,
      notes,
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
        },
      },

      technicianService: {
        select: {
          id: true,
          price: true,
          pricingType: true,
          estimatedDuration: true,
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },

          technician: {
            select: {
              id: true,
              bio: true,
              yearsOfExperience: true,
              availabilityStatus: true,
              averageRating: true,
              totalReviews: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // =========================
  // Organized Response
  // =========================

  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingDate: booking.bookingDate,
    scheduledStart: booking.scheduledStart,
    scheduledEnd: booking.scheduledEnd,
    serviceAddress: booking.serviceAddress,
    latitude: booking.latitude,
    longitude: booking.longitude,
    totalAmount: booking.totalAmount,
    status: booking.status,
    notes: booking.notes,
    customer: booking.customer,

    service: {
      id: booking.technicianService.service.id,
      name: booking.technicianService.service.name,
      description: booking.technicianService.service.description,
      price: booking.technicianService.price,
      pricingType: booking.technicianService.pricingType,
      estimatedDuration: booking.technicianService.estimatedDuration,
    },

    technician: {
      id: booking.technicianService.technician.id,
      name: booking.technicianService.technician.user.name,
      phone: booking.technicianService.technician.user.phone,
      profileImage: booking.technicianService.technician.user.profileImage,
      bio: booking.technicianService.technician.bio,
      yearsOfExperience: booking.technicianService.technician.yearsOfExperience,
      availabilityStatus:
        booking.technicianService.technician.availabilityStatus,
      averageRating: booking.technicianService.technician.averageRating,
      totalReviews: booking.technicianService.technician.totalReviews,
    },
  };
};

export const bookingService = {
  getMyBookingsFromDB,
  getBookingByIdFromDB,
  createBookingIntoDB,
};
