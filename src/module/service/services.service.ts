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
const getAllTechnicianServicesFromDB = async (
  query: Record<string, any>
) => {
  const {
    category,
    city,
    rating,
    minPrice,
    maxPrice,
  } = query;

  const where: any = {
    status: "ACTIVE",

    service: {
      status: "ACTIVE",
    },

    technician: {
      availabilityStatus: "ONLINE",
    },
  };

  // Category Filter
  if (category) {
    where.service.category = {
      name: {
        equals: category,
        mode: "insensitive",
      },
    };
  }

  // City Filter
  if (city) {
    where.technician.user = {
      city: {
        equals: city,
        mode: "insensitive",
      },
    };
  }

  // Rating Filter
  if (rating) {
    where.technician.averageRating = {
      gte: Number(rating),
    };
  }

  // Price Filter
  if (minPrice || maxPrice) {
    where.price = {};

    if (minPrice) {
      where.price.gte = Number(minPrice);
    }

    if (maxPrice) {
      where.price.lte = Number(maxPrice);
    }
  }

  const services = await prisma.technicianService.findMany({
    where,

    select: {
      id: true,
      price: true,
      pricingType: true,
      estimatedDuration: true,
      serviceImage: true,

      service: {
        select: {
          name: true,
          description: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },

      technician: {
        select: {
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

  return services.map((item) => ({
    id: item.id,
    price: item.price,
    pricingType: item.pricingType,
    estimatedDuration: item.estimatedDuration,
    serviceImage: item.serviceImage,

    service: {
      name: item.service.name,
      description: item.service.description,
      category: item.service.category.name,
    },

    technician: {
      id: item.technician.user.id,
      name: item.technician.user.name,
      city: item.technician.user.city,
      profileImage: item.technician.user.profileImage,
      averageRating: item.technician.averageRating,
      totalReviews: item.technician.totalReviews,
    },
  }));
};

// Get All Technicians
const getAllTechniciansFromDB = async () => {
  const technicians = await prisma.technicianProfile.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return technicians;
};

// Get Technicians Profile By Id
export const getTechnicianByIdFromDB = async (technicianId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      id: technicianId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          city: true,
        },
      },

      technicianServices: {
        where: {
          status: "ACTIVE",
        },

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

          bookings: {
            include: {
              review: true,

              customer: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!technician) {
    throw new Error("Technician not found.");
  }

  // Services
  const services = technician.technicianServices.map((item) => ({
    id: item.id,
    price: item.price,
    pricingType: item.pricingType,
    estimatedDuration: item.estimatedDuration,
    serviceImage: item.serviceImage,

    service: {
      id: item.service.id,
      name: item.service.name,
      description: item.service.description,
      category: item.service.category.name,
    },
  }));

  // Reviews
  const reviews = technician.technicianServices
    .flatMap((service) => service.bookings)
    .filter((booking) => booking.review)
    .map((booking) => ({
      id: booking.review!.id,
      rating: booking.review!.rating,
      comment: booking.review!.comment,
      createdAt: booking.review!.createdAt,

      customer: {
        id: booking.customer.id,
        name: booking.customer.name,
        profileImage: booking.customer.profileImage,
      },
    }));

  return {
    id: technician.id,

    name: technician.user.name,
    profileImage: technician.user.profileImage,
    city: technician.user.city,

    bio: technician.bio,
    yearsOfExperience: technician.yearsOfExperience,
    experienceDescription: technician.experienceDescription,

    availabilityStatus: technician.availabilityStatus,
    verificationStatus: technician.verificationStatus,

    averageRating: technician.averageRating,
    totalReviews: technician.totalReviews,
    totalCompletedJobs: technician.totalCompletedJobs,

    services,
    reviews,
  };
};

// Get All Categories
const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};


export const servicesService = {
  getAllServicesFromDB,
  getAllTechnicianServicesFromDB,
  getAllTechniciansFromDB,
  getTechnicianByIdFromDB,
  getAllCategoriesFromDB,
};
