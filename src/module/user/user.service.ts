import { prisma } from "../../lib/prisma";
import { getAdminProfileFromDB } from "../admin/admin.service";
import { USER_ROLE } from "../auth/auth.constant";
import { getTechnicianProfileFromDB } from "../technician/technician.service";
import { TUser } from "./user.interface";


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

export const userService = {
  getMyProfileFromDB,
};
