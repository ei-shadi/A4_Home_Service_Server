import { prisma } from "../../lib/prisma";

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