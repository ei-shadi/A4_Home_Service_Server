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
          services: {
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
  });

  return {
    ...technician,
    role: technician.role.name,
  };
};

export const userService = {

};
