import { prisma } from "../../lib/prisma";
import { IUpdateCategory, TCategoryStatus } from "./admin.interface";

// Get Admin Profile
export const getAdminProfileFromDB = async (userId: string) => {
  const admin = await prisma.user.findUniqueOrThrow({
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
    },
  });

  return {
    ...admin,
    role: admin.role.name,
  };
};

// Get All Users From DB
const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    ...user,
    role: user.role.name,
  }));
};

// Get All Bookings From DB
const getAllBookingsFromDB = async () => {
  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
}

// Get All Categories From DB
const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
}

// Update Category
const updateCategoryIntoDB = async (
  id: string,
  payload: IUpdateCategory
) => {
  const { name, icon, description, status } = payload;

  // Check payload
  if (Object.keys(payload).length === 0) {
    throw new Error("Please provide at least one field to update.");
  }

  // Normalize status
  const normalizedStatus = status
    ? (status.toUpperCase() as TCategoryStatus)
    : undefined;

  // Check duplicate category name
  if (name) {
    const isNameExist = await prisma.category.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });

    if (isNameExist) {
      throw new Error("Category name already exists.");
    }
  }

  // Update category
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      icon,
      description,
      status: normalizedStatus,
    },
  });

  return updatedCategory;
};

 
export const adminService = {
  getAllUsersFromDB,
  getAllBookingsFromDB,
  getAllCategoriesFromDB,
  updateCategoryIntoDB,
};