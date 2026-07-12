import { ServiceStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IUpdateTechnicianProfile } from "./technician.interface";

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


// Update Profile
export const updateProfileIntoDB = async (
  userId: string,
  payload: IUpdateTechnicianProfile
) => {
  const {
    bio,
    yearsOfExperience,
    experienceDescription,
    availabilityStatus,
    technicianServices,
  } = payload;

  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found.");
  }

  return await prisma.$transaction(async (tx) => {
    // Update Profile
    await tx.technicianProfile.update({
      where: {
        userId,
      },
      data: {
        bio,
        yearsOfExperience,
        experienceDescription,
        availabilityStatus,
      },
    });

    // Create / Update Technician Services
    if (technicianServices?.length) {
      for (const item of technicianServices) {
        const service = await tx.service.findUnique({
          where: {
            id: item.serviceId,
          },
        });

        if (!service) {
          throw new Error("Service not found.");
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
            price: item.price,
            pricingType: item.pricingType,
            estimatedDuration: item.estimatedDuration,
            serviceImage: item.serviceImage,
            status: item.status ?? ServiceStatus.ACTIVE,
          },
        });
      }
    }

    return await tx.technicianProfile.findUnique({
      where: {
        userId,
      },
      include: {
        technicianServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  });
};

export const technicianService = {
  updateProfileIntoDB,
};