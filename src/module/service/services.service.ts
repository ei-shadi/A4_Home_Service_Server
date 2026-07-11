import { prisma } from "../../lib/prisma";


const getAllServicesFromDB = async (query: Record<string, unknown>) => {
  const services = await prisma.service.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      category: true,
      technician: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  });

  return services;
};

export const servicesService = {
  getAllServicesFromDB,
};