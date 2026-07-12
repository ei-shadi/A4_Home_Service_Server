import { ServiceStatus, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ICategory, IService, IUpdateUserStatus, TCategoryStatus } from "./admin.interface";
import { TUserStatus } from "../user/user.interface";

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

// Create Category Into DB
const createCategoryIntoDB = async (payload: ICategory) => {
  const { name, icon, description, status } = payload;

  // Check payload
  if (Object.keys(payload).length === 0) {
    throw new Error("Please provide category information.");
  }

  // Normalize name
  const normalizedName = name.trim();

  // Normalize status
  const normalizedStatus = status
    ? (status.toUpperCase() as TCategoryStatus)
    : undefined;

  // Check duplicate category name
  const isNameExist = await prisma.category.findUnique({
    where: {
      name: normalizedName,
    },
  });

  if (isNameExist) {
    throw new Error("Category already exists.");
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      name: normalizedName,
      icon,
      description,
      status: normalizedStatus,
    },
  });

  return category;
};

// Create Service Into DB
const createServiceIntoDB = async (payload: IService) => {
  const { categoryId, title, description, status } = payload;

  // Check payload
  if (Object.keys(payload).length === 0) {
    throw new Error("Please provide service information.");
  }

  // Normalize
  const normalizedTitle = title.trim();

  const normalizedStatus = status
    ? (status.toUpperCase() as ServiceStatus)
    : undefined;

  // Check category exists
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // Check duplicate service under same category
  const isServiceExist = await prisma.service.findFirst({
    where: {
      categoryId,
      title: normalizedTitle,
    },
  });

  if (isServiceExist) {
    throw new Error("Service already exists in this category.");
  }

  // Create service
  const service = await prisma.service.create({
    data: {
      categoryId,
      title: normalizedTitle,
      description,
      status: normalizedStatus,
    },
    include: {
      category: true,
    },
  });

  return service;
};

// Update User Status Into DB
const updateUserStatusIntoDB = async (
  id: string,
  payload: IUpdateUserStatus
) => {
  const { status } = payload;

  // Check payload
  if (!status) {
    throw new Error("Status is required.");
  }

  // Normalize status
  const normalizedStatus = status.toUpperCase() as TUserStatus;

  // Check user exists
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // Prevent banning Admin (Recommended)
  if (user.role.name === "ADMIN") {
    throw new Error("Admin status cannot be changed.");
  }

  // Update
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: normalizedStatus,
    },
    omit: {
      passwordHash: true,
      roleId: true,
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
    ...updatedUser,
    role: updatedUser.role.name,
  };
};


export const adminService = {
  getAllUsersFromDB,
  getAllBookingsFromDB,
  getAllCategoriesFromDB,
  createCategoryIntoDB,
  createServiceIntoDB,
  updateUserStatusIntoDB
};