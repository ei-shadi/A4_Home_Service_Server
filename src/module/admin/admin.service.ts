import { prisma } from "../../lib/prisma";

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

export const userService = {

};
