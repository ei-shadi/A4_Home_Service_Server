import { prisma } from "../../lib/prisma";
import { getAdminProfileFromDB } from "../admin/admin.service";
import { USER_ROLE } from "../auth/auth.constant";
import { getTechnicianProfileFromDB } from "../technician/technician.service";
import { IUpdateUserProfile, TUser } from "./user.interface";

// Get Customer Profile
const getCustomerProfile = async (userId: string) => {
  const customer = await prisma.user.findUniqueOrThrow({
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
    ...customer,
    role: customer.role.name,
  };
};

// Get My Profile
const getMyProfileFromDB = async (user: TUser) => {

  switch (user.role) {
    case USER_ROLE.CUSTOMER:
      return getCustomerProfile(user.id);

    case USER_ROLE.TECHNICIAN:
      return getTechnicianProfileFromDB(user.id);

    case USER_ROLE.ADMIN:
      return getAdminProfileFromDB(user.id);

    default:
      throw new Error("Invalid role");
  }
};

// Update My Profile
const updateProfileIntoDB = async (
  userId: string,
  payload: IUpdateUserProfile
) => {
  const {
    name,
    email,
    phone,
    profileImage,
    address,
    city,
    latitude,
    longitude,
  } = payload;

  // Check user exists
  await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  // Optional: Check duplicate email
  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingEmail) {
      throw new Error("Email already exists.");
    }
  }

  // Optional: Check duplicate phone
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingPhone) {
      throw new Error("Phone already exists.");
    }
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      email,
      phone,
      profileImage,
      address,
      city,
      latitude,
      longitude,
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
    ...user,
    role: user.role.name,
  };
};
 
export const userService = {
  getMyProfileFromDB,
  updateProfileIntoDB,
};
