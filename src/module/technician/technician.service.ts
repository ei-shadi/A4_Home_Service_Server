import { prisma } from "../../lib/prisma";

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
const updateProfileIntoDB = async (
  userId: string,
  payload: any
) => {

  const {
    services,
    ...profileData
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

    await tx.technicianProfile.update({
      where: {
        id: technician.id,
      },
      data: profileData,
    });

    if (services?.length) {

      for (const service of services) {

        const serviceExist = await tx.service.findFirst({
          where: {
            id: service.id,
            technicianId: technician.id,
          },
        });

        if (!serviceExist) {
          throw new Error(`Service ${service.id} not found.`);
        }

        await tx.service.update({
          where: {
            id: service.id,
          },
          data: {
            title: service.title,
            description: service.description,
            price: service.price,
            pricingType: service.pricingType,
            estimatedDuration: service.estimatedDuration,
            serviceImage: service.serviceImage,
            categoryId: service.categoryId,
          },
        });
      }
    }

    return await tx.technicianProfile.findUnique({
      where: {
        id: technician.id,
      },
      include: {
        user: true,
        services: {
          include: {
            category: true,
          },
        },
      },
    });
  });
};

export const technicianService = {
  updateProfileIntoDB,
};