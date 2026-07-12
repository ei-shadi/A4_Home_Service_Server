import { prisma } from "../../lib/prisma";


// Get All Services From DBconst getAllServicesFromDB = async () => {
const getAllServicesFromDB = async () => {
  const services = await prisma.service.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return services.map(({ category, ...service }) => ({
    ...service,
    category: category.name,
  }));
};

// Get All Technician Services
const getAllTechnicianServicesFromDB = async () => {
  const services = await prisma.technicianService.findMany({
    where: {
      status: "ACTIVE",
      service: {
        status: "ACTIVE",
      },
      technician: {
        availabilityStatus: "ONLINE"
      },
    },

    include: {
      service: {
        select: {
          id: true,
          name: true,
          description: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      technician: {
        select: {
          id: true,
          averageRating: true,
          totalReviews: true,

          user: {
            select: {
              id: true,
              name: true,
              city: true,
              profileImage: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return services;
};

export const servicesService = {
 getAllServicesFromDB,
 getAllTechnicianServicesFromDB,
};