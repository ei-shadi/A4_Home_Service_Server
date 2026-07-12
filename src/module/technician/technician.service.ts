import { ServiceStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IUpdateTechnicianProfile } from "./technician.interface";
import { AvailabilityStatus } from "@prisma/client";
import { IUpdateAvailabilityStatus } from "./technician.interface";
import { BookingStatus } from "@prisma/client";
import { IUpdateBookingStatus } from "./technician.interface";


// Get Technician Profile
export const getTechnicianProfileFromDB = async (userId: string) => {
  const technician = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      roleId: true,
      passwordHash: true,
      deletedAt: true,
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },

      technicianProfile: {
        include: {
          technicianServices: {
            include: {
              service: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    ...technician,
    role: technician.role.name,
  };
};

// Get My Bookings
export const getMyBookingsFromDB = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found.");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      technicianService: {
        technicianId: technician.id,
      },
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          city: true,
        },
      },

      technicianService: {
        include: {
          service: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },

      payment: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
};

// Update Profile
const updateProfileIntoDB = async (
  userId: string,
  payload: IUpdateTechnicianProfile,
) => {
  const {
    bio,
    yearsOfExperience,
    experienceDescription,
    availabilityStatus,

    averageRating,
    totalReviews,
    totalCompletedJobs,

    technicianServices,
  } = payload;

  // Check technician profile exists
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found.");
  }

  return await prisma.$transaction(async (tx) => {
    // Update technician profile
    await tx.technicianProfile.update({
      where: {
        userId,
      },
      data: {
        bio,
        yearsOfExperience,
        experienceDescription,
        availabilityStatus,

        averageRating,
        totalReviews,
        totalCompletedJobs,
      },
    });

    // Create / Update technician services
    if (technicianServices?.length) {
      for (const item of technicianServices) {
        // Check service exists
        const service = await tx.service.findUnique({
          where: {
            id: item.serviceId,
          },
        });

        if (!service) {
          throw new Error(`Service not found: ${item.serviceId}`);
        }

        await tx.technicianService.upsert({
          where: {
            technicianId_serviceId: {
              technicianId: technician.id,
              serviceId: item.serviceId,
            },
          },

          update: {
            price: item.price,
            pricingType: item.pricingType,
            estimatedDuration: item.estimatedDuration,
            serviceImage: item.serviceImage,
            status: item.status,
          },

          create: {
            technicianId: technician.id,
            serviceId: item.serviceId,
            price: item.price!,
            pricingType: item.pricingType!,
            estimatedDuration: item.estimatedDuration!,
            serviceImage: item.serviceImage,
            status: item.status ?? ServiceStatus.ACTIVE,
          },
        });
      }
    }

    // Return updated profile
    const updatedProfile = await tx.technicianProfile.findUnique({
      where: {
        userId,
      },
      omit: {
        userId: true,
      },
      include: {
        technicianServices: {
          include: {
            service: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return updatedProfile;
  });
};

// Update Availability Status
const updateAvailabilityStatusIntoDB = async (
  userId: string,
  payload: IUpdateAvailabilityStatus
) => {
  const { availabilityStatus } = payload;

  // Check payload
  if (!availabilityStatus) {
    throw new Error("Availability status is required.");
  }

  // Normalize (online -> ONLINE)
  const normalizedAvailabilityStatus =
    availabilityStatus.toUpperCase() as AvailabilityStatus;

  // Validate
  if (
    !Object.values(AvailabilityStatus).includes(normalizedAvailabilityStatus)
  ) {
    throw new Error(
      `Invalid availability status. Allowed values: ${Object.values(
        AvailabilityStatus
      ).join(", ")}`
    );
  }

  // Check technician exists
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found.");
  }

  // Update
  await prisma.technicianProfile.update({
    where: {
      userId,
    },
    data: {
      availabilityStatus: normalizedAvailabilityStatus,
    },
  });

  // Return updated profile
  return await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    omit: {
      userId: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          profileImage: true,
        },
      },
    },
  });
};

// Update Bookings Status
export const updateBookingStatusIntoDB = async (
  userId: string,
  bookingId: string,
  payload: IUpdateBookingStatus
) => {
  const { status } = payload;

  // Find technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found.");
  }

  // Find booking that belongs to this technician
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      technicianService: {
        technicianId: technician.id,
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Prevent updating cancelled/completed bookings
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.COMPLETED
  ) {
    throw new Error(
      `Booking is already ${booking.status.toLowerCase()}.`
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status,
      completedAt:
        status === BookingStatus.COMPLETED ? new Date() : null,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },

      technicianService: {
        include: {
          service: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },

      payment: true,
    },
  });

  return updatedBooking;
};

export const technicianService = {
  getMyBookingsFromDB,
  updateProfileIntoDB,
  updateAvailabilityStatusIntoDB,
  updateBookingStatusIntoDB,
};
